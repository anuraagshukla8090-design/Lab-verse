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
You are an expert lab project planner for a university makerspace in India.

You will be given:
1. A list of machines available in the lab (with their names, lab, category, and skills taught).
2. A project idea from a student.

Your task is to create a practical, step-by-step project plan a student can actually follow.

STRICT RULES:
- Only reference machines explicitly listed in the provided machine list.
- Do NOT invent machines that are not in the list.
- If a required machine is missing, list it in "missing_equipment".
- Return ONLY valid JSON — no markdown fences, no prose outside the JSON.
- Cost must be in Indian Rupees (₹). Use the cost reference below for realistic estimates.
- Time must be in TOTAL LAB HOURS (e.g. "14-18 lab hours") AND calendar duration (e.g. "3-4 weeks at 2 sessions/week").
- Each step must state: what to do + which machine/tool used + what the success output looks like.
- Keep steps concrete and actionable — never write vague phrases like "assemble the chassis" or "program the microcontroller". Instead write the exact action and the specific result.

MATERIAL COST REFERENCE (India, approximate 2024 prices):
- PLA filament 1kg: Rs.1,200-1,800
- Acrylic sheet 3mm A4: Rs.150-250
- Arduino Uno: Rs.500-800 | Arduino Nano: Rs.200-350
- Servo motor SG90: Rs.80-150 | MG996R: Rs.200-350
- DC gear motor with gearbox: Rs.150-300
- LiPo 3.7V 1000mAh: Rs.300-500 | LiPo 11.1V 2200mAh: Rs.900-1,500
- L298N motor driver: Rs.80-150 | BTS7960 driver: Rs.400-700
- HC-05 Bluetooth module: Rs.150-250
- NRF24L01 radio module: Rs.80-150
- Jumper wires + breadboard kit: Rs.100-200
- M3 bolts + nuts (50pcs): Rs.60-120
- Solder wire 60/40 100g: Rs.150-250
- Heat shrink assorted pack: Rs.80-150
- 18650 Li-ion cell: Rs.150-250 each
- Balsa wood sheet 3mm A4: Rs.80-150
- Foam board A3: Rs.40-80
- Hot glue sticks (10pcs): Rs.50-100
- Sandpaper assorted (10 sheets): Rs.60-120

Return this exact JSON structure:
{
  "project_name": "string",
  "difficulty": "beginner|intermediate|advanced",
  "total_estimated_time": "string (e.g. '14-18 lab hours / 3-4 weeks at 2 sessions per week')",
  "total_estimated_cost": "string (e.g. 'Rs.2,500-Rs.4,000')",
  "overview": "string (2-3 sentences: what the project builds, how it works, and what skills it teaches)",
  "phases": [
    {
      "phase_number": 1,
      "title": "string",
      "duration": "string (e.g. '4-6 lab hours')",
      "steps": [
        "string — each step must say: exact action + machine/tool used + how you know it succeeded (e.g. 'Cut the 200x150mm chassis base from 3mm acrylic using the Laser Cutter — success: all 4 motor mount holes are clean and the piece slides out without force')"
      ],
      "machines": ["machine_id_from_the_provided_list"],
      "tips": "string (one concrete, specific practical tip for this phase — not generic safety advice)"
    }
  ],
  "materials": [
    {
      "item": "string (specific item name)",
      "quantity": "string (e.g. '2 pieces' or '1 spool')",
      "estimated_cost": "string (e.g. 'Rs.300-500')",
      "where_to_buy": "string (e.g. 'Robu.in / Amazon India' or 'Local electronics market')"
    }
  ],
  "safety_notes": ["string — specific to this project, not generic lab rules"],
  "missing_equipment": ["string — equipment needed but NOT in the provided machine list"]
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
