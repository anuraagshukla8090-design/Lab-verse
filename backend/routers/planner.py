"""
LabVerse — Project Planner Router  (backend/routers/planner.py)

POST /plan
  Body: { "project": "RC Car", "lab_ids": ["main_lab", "mechanical_lab"] }

Loads machines.json, builds a compact machine context, sends it to the
LLM via OpenRouter, and returns a structured project plan (phases, steps,
machines, cost, time).

No RAG / Qdrant — machine metadata is compact enough for direct context injection.
"""

import json
import os
import re
import time
import httpx
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/plan", tags=["planner"])

DATA_DIR = Path(__file__).parent.parent / "data"

# ── Lab id → friendly label ────────────────────────────────────────────────────
LAB_LABELS = {
    "main_lab":        "Engineering Lab",
    "mechanical_lab":  "Mechanical Lab",
    "prototyping_lab": "Engineering Lab",  # legacy alias in machines.json
}

# ── Request model ──────────────────────────────────────────────────────────────
class PlanRequest(BaseModel):
    project: str
    lab_ids: list[str] = ["main_lab", "mechanical_lab"]

# ── System prompt ──────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """\
You are an expert lab project planner for a university makerspace.

You will be given:
1. A list of machines available in the lab (with their names, lab, category, and skills taught).
2. A project idea from a student.

Your task is to create a practical, step-by-step project plan.

STRICT RULES:
- Only reference machines that are explicitly listed in the provided machine list.
- Do NOT invent or suggest machines that are not in the list.
- If a required machine is missing from the lab, mention it in a "missing_equipment" field.
- Return ONLY valid JSON — no markdown fences, no prose, no explanation outside the JSON.
- Cost must be in Indian Rupees (₹) with a range (e.g., "₹500–₹1,500").
- Time estimates must be realistic for a university student with limited lab experience.

Return this exact JSON structure:
{
  "project_name": "string",
  "difficulty": "beginner|intermediate|advanced",
  "total_estimated_time": "string (e.g. 2-3 weeks)",
  "total_estimated_cost": "string (e.g. ₹2,000–₹5,000)",
  "overview": "string (2-3 sentences describing the project)",
  "phases": [
    {
      "phase_number": 1,
      "title": "string",
      "duration": "string (e.g. 2-3 days)",
      "steps": ["string", "string"],
      "machines": ["machine_id_1", "machine_id_2"],
      "tips": "string (optional practical tip)"
    }
  ],
  "materials": ["string"],
  "safety_notes": ["string"],
  "missing_equipment": ["string"]
}
"""

# ── Retry config ───────────────────────────────────────────────────────────────
MAX_RETRIES   = 3
RETRY_BACKOFF = 2


# ── Helpers ────────────────────────────────────────────────────────────────────

def _load_machines(lab_ids: list[str]) -> dict:
    """Load machines.json and filter to the requested lab_ids."""
    path = DATA_DIR / "machines.json"
    if not path.exists():
        raise HTTPException(status_code=500, detail="machines.json not found.")
    with open(path, encoding="utf-8") as f:
        all_machines = json.load(f)

    # Normalise lab_ids — map 'main_lab' to also include 'prototyping_lab' alias
    expanded = set(lab_ids)
    if "main_lab" in expanded:
        expanded.add("prototyping_lab")

    filtered = {
        mid: data
        for mid, data in all_machines.items()
        if data.get("lab", "") in expanded
    }
    return filtered


def _build_machine_context(machines: dict) -> str:
    """Build a compact, LLM-readable machine list grouped by lab and category."""
    # Group by lab → category
    grouped: dict[str, dict[str, list]] = {}
    for mid, data in machines.items():
        lab_raw = data.get("lab", "unknown")
        lab     = LAB_LABELS.get(lab_raw, lab_raw.replace("_", " ").title())
        cat     = data.get("category", "general").replace("_", " ").title()
        skills  = data.get("skills_taught", [])[:3]  # top-3 skills only

        grouped.setdefault(lab, {}).setdefault(cat, []).append(
            f"  - {data.get('name', mid)} (id: {mid}) — teaches: {', '.join(skills)}"
        )

    lines = ["AVAILABLE MACHINES:"]
    for lab, cats in grouped.items():
        lines.append(f"\n[{lab}]")
        for cat, entries in cats.items():
            lines.append(f"  {cat}:")
            lines.extend(entries)
    return "\n".join(lines)


def _call_llm(project: str, machine_context: str) -> dict:
    """Call Groq and return a parsed plan dict."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY is not configured. Add it to backend/.env and restart."
        )

    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    user_message = (
        f"{machine_context}\n\n"
        f"PROJECT IDEA: {project}\n\n"
        f"Generate a complete project plan following the JSON schema exactly."
    )

    payload = {
        "model":    model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_message},
        ],
        "temperature": 0.2,
        "max_tokens":  1500,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type":  "application/json",
    }

    timeout = httpx.Timeout(connect=5.0, read=30.0, write=5.0, pool=5.0)

    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            with httpx.Client(timeout=timeout) as client:
                resp = client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers=headers,
                    json=payload,
                )

            if resp.status_code == 429:
                retry_after = RETRY_BACKOFF * (attempt + 1)
                wait_time   = min(float(resp.json().get("error", {}).get("metadata", {}).get("retry_after_seconds", retry_after)), 15.0)
                if attempt < MAX_RETRIES - 1:
                    time.sleep(wait_time)
                    continue
                raise HTTPException(status_code=429, detail="AI service rate limited. Please try again in a moment.")

            resp.raise_for_status()
            data = resp.json()

            choices = data.get("choices", [])
            if not choices:
                raise RuntimeError("OpenRouter returned no choices.")
            content = choices[0].get("message", {}).get("content", "").strip()
            if not content:
                raise RuntimeError("OpenRouter returned empty content.")

            # Strip markdown fences if the model wraps JSON despite instructions
            content = re.sub(r"^```(?:json)?\s*", "", content)
            content = re.sub(r"\s*```$", "", content)
            content = content.strip()

            plan = json.loads(content)
            return plan

        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"LLM returned invalid JSON: {e}")
        except httpx.TimeoutException:
            last_error = "AI service timed out. Please try again."
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_BACKOFF)
                continue
            raise HTTPException(status_code=504, detail=last_error)
        except HTTPException:
            raise
        except Exception as exc:
            last_error = str(exc)
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_BACKOFF)
                continue
            raise HTTPException(status_code=500, detail=f"Planner error: {last_error}")

    raise HTTPException(status_code=500, detail="Planner failed after retries.")


# ── Endpoint ───────────────────────────────────────────────────────────────────

@router.post("")
async def generate_plan(body: PlanRequest):
    """
    Generate a structured project plan grounded in available lab machines.

    Returns a plan with phases, steps, machines_used, cost estimate, and time estimate.
    """
    if not body.project.strip():
        raise HTTPException(status_code=400, detail="Project description cannot be empty.")

    if len(body.project) > 500:
        raise HTTPException(status_code=400, detail="Project description too long (max 500 chars).")

    machines        = _load_machines(body.lab_ids)
    machine_context = _build_machine_context(machines)
    plan            = _call_llm(body.project.strip(), machine_context)

    # Attach the machine metadata for chips in the frontend (name, lab)
    machine_meta = {
        mid: {"name": d.get("name", mid), "lab": LAB_LABELS.get(d.get("lab", ""), d.get("lab", ""))}
        for mid, d in machines.items()
    }

    return {
        "plan":         plan,
        "machine_meta": machine_meta,
    }
