"""
LabVerse RAG — Answer Generation  (backend/rag/chat.py)

Uses OpenRouter via direct httpx POST for reliable timeout control.
Model is read from OPENROUTER_MODEL env var — never hardcoded.

Hallucination prevention at two levels:
  1. Architecture: LLM is never called when retrieval returns 0 confident chunks.
  2. Prompt: system instruction explicitly forbids outside knowledge.
"""

import os
import httpx
from .retriever import retrieve

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """\
You are a laboratory assistant.

Use the provided context as the source of truth.

You may:
- simplify explanations
- provide analogies
- provide examples
- explain concepts for beginners
- explain step-by-step
- compare concepts

However, do not invent technical facts that are not supported by the retrieved context.

If the answer cannot be supported by the context, clearly state that the documentation does not contain that information.\
"""

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

    # Step 4 — call OpenRouter via httpx (reliable timeout, no openai client issues)
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError(
            "OPENROUTER_API_KEY is not set. "
            "Add it to backend/.env and restart the server."
        )

    model = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.2-3b-instruct:free")

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_message},
        ],
        "temperature": 0.1,
        "max_tokens":  512,
    }

    # connect=5s, read=25s — total max ~30s, fails hard on timeout
    timeout = httpx.Timeout(connect=5.0, read=25.0, write=5.0, pool=5.0)

    with httpx.Client(timeout=timeout) as client:
        resp = client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type":  "application/json",
                "HTTP-Referer":  "http://localhost:5173",
                "X-Title":       "LabVerse",
            },
            json=payload,
        )

    resp.raise_for_status()
    data = resp.json()

    answer_text = data["choices"][0]["message"]["content"].strip()

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
