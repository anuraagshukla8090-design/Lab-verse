"""
LabVerse RAG — Answer Generation  (backend/rag/chat.py)

Uses OpenRouter via direct httpx POST for reliable timeout control.
Model is read from OPENROUTER_MODEL env var — never hardcoded.

Hallucination prevention at two levels:
  1. Architecture: LLM is never called when retrieval returns 0 confident chunks.
  2. Prompt: system instruction explicitly forbids outside knowledge.
"""

import os
import time
import httpx
from .retriever import retrieve

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """\
You are a laboratory assistant.

Use the provided context as the source of truth for all technical facts.

You may:
- simplify explanations
- provide analogies
- provide examples
- explain concepts for beginners
- explain step-by-step
- compare concepts

You are allowed to create your own analogies and examples as teaching tools.

The technical facts within those analogies and examples must remain consistent with the provided context.

Only state that the documentation does not contain the information when the underlying technical concept itself is missing from the retrieved context.

If the concept exists in the context, answer using the teaching style requested by the user.

Do not invent specifications, measurements, procedures, warnings, capabilities, or technical claims that are not supported by the provided context.\
"""

# ---------------------------------------------------------------------------
# Retry config
# ---------------------------------------------------------------------------

MAX_RETRIES   = 3
RETRY_BACKOFF = 2  # seconds between retries (doubles each attempt)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def answer(machine_id: str, question: str) -> dict:
    """
    Full RAG pipeline:
      retrieve → confidence filter → (fallback OR OpenRouter LLM) → response

    Args:
        machine_id: Exact machines.json key  (e.g. "oscilloscope")
        question:   User question string

    Returns:
        dict with keys: answer, machine_id, chunks_used, sources
    """
    # Step 1 — retrieve + confidence-filter chunks from Qdrant
    chunks = retrieve(machine_id, question, top_k=8)

    # Step 2 — architecture guard: no confident chunks → no LLM call
    if not chunks:
        return {
            "answer":      "I don't have information about that in the available documentation.",
            "machine_id":  machine_id,
            "chunks_used": 0,
            "sources":     [],
        }

    # Step 3 — build context from surviving chunks
    context_parts = [
        f"[Source: {c['source']} | chunk {c['chunk_index']}]\n{c['text']}"
        for c in chunks
    ]
    context = "\n\n---\n\n".join(context_parts)

    user_message = (
        f"--- DOCUMENTATION CONTEXT ---\n"
        f"{context}\n"
        f"--- END CONTEXT ---\n\n"
        f"Question: {question}"
    )

    # Step 4 — call OpenRouter via httpx with retry logic
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError(
            "GROQ_API_KEY is not set. "
            "Add it to backend/.env and restart the server."
        )

    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_message},
        ],
        "temperature": 0.1,
        "max_tokens":  512,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type":  "application/json",
    }

    # connect=5s, read=25s — total max ~30s per attempt
    timeout = httpx.Timeout(connect=5.0, read=25.0, write=5.0, pool=5.0)

    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            with httpx.Client(timeout=timeout) as client:
                resp = client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers=headers,
                    json=payload,
                )

            # On 429, wait and retry
            if resp.status_code == 429:
                retry_after = RETRY_BACKOFF * (attempt + 1)
                error_data = resp.json().get("error", {})
                metadata = error_data.get("metadata", {})
                suggested_wait = metadata.get("retry_after_seconds", retry_after)
                wait_time = min(float(suggested_wait), 10.0)  # cap at 10s
                if attempt < MAX_RETRIES - 1:
                    time.sleep(wait_time)
                    continue
                else:
                    raise RuntimeError(
                        f"Rate limited after {MAX_RETRIES} attempts. "
                        "The AI service is busy — please try again in a moment."
                    )

            resp.raise_for_status()
            data = resp.json()

            # Null-safe content extraction
            choices = data.get("choices", [])
            if not choices:
                raise RuntimeError("OpenRouter returned no choices in response.")

            content = choices[0].get("message", {}).get("content")
            if content is None:
                raise RuntimeError("OpenRouter returned empty content.")

            answer_text = content.strip()
            # Strip <pad> tokens that some free-tier models emit
            answer_text = answer_text.replace("<pad>", "").strip()
            if not answer_text:
                raise RuntimeError("OpenRouter returned only padding tokens.")
            break  # success — exit retry loop

        except httpx.TimeoutException:
            last_error = RuntimeError(
                "The AI service timed out. Please try again."
            )
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_BACKOFF)
                continue
            raise last_error

        except RuntimeError:
            raise  # don't retry on our own errors

        except Exception as exc:
            last_error = exc
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_BACKOFF)
                continue
            raise

    # Step 5 — return answer + source metadata
    return {
        "answer":      answer_text,
        "machine_id":  machine_id,
        "chunks_used": len(chunks),
        "sources": [
            {
                "source":      c["source"],
                "chunk_index": c["chunk_index"],
                "score":       c["score"],
            }
            for c in chunks
        ],
    }
