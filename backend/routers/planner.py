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

try:
    import json_repair
except ImportError:
    json_repair = None

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
You are an expert Makerspace Project Architect & Engineering Mentor at an advanced university laboratory in India.

You will be given:
1. AVAILABLE LAB EQUIPMENT: A list of machines and workstations present in the lab (with exact machine IDs).
2. A project idea from a student.

Your mission:
Create an exceptionally detailed, highly technical, end-to-end engineering project guide taking the student from the very first raw material cut to the final working prototype.

CRITICAL STEP-BY-STEP REQUIREMENTS:
- Generate 4 to 5 comprehensive phases covering the full project from start to finish:
  1. Mechanical Fabrication & Chassis Prep
  2. Actuators, Motors & Power Delivery
  3. Electronics Assembly & Circuit Soldering
  4. Firmware, Libraries & Control Programming
  5. Integration, Calibration & Systematic Testing
- Each phase MUST contain 4 to 5 rich, numbered steps in the "steps" array.
- Every step must state exact actions, tool/machine parameters, and verification criteria.
- CRITICAL FOR REASONING: Keep internal thinking under 50 words and immediately output the full JSON starting with { so all phases and steps are generated completely.

STRICT RULES:
- INNOVATION: Infuse modern, innovative features (IoT telemetry, AI vision, adaptive PID control, or modular mechanisms) in 'innovation_angle'.
- WHAT WE HAVE: Map fabrication and testing tasks to machines in the AVAILABLE LAB EQUIPMENT list.
- WHAT TO BUY (BOM): List specific electronic components, sensors, microcontrollers, and materials with realistic Indian Rupee (₹) costs, exact specs, and vendors (Robu.in, ElectronicsComp, Amazon India, Local SP Road).
- MISSING EQUIPMENT: List any tool not in the lab with a practical workaround.
- SYNTAX: Return ONLY valid raw JSON — no markdown fences, no commentary. Use single quotes inside strings.

MATERIAL COST REFERENCE (India, approximate 2024 prices):
- PLA / PETG filament 1kg: Rs. 1,100 - Rs. 1,600
- Acrylic sheet 3mm A4: Rs. 150 - Rs. 250
- ESP32 NodeMCU: Rs. 350 - Rs. 500 | Arduino Uno: Rs. 500 - Rs. 800 | STM32: Rs. 300 - Rs. 550
- Servo motor SG90: Rs. 90 - Rs. 150 | MG996R: Rs. 280 - Rs. 400
- TT Gear Motor with wheel: Rs. 120 - Rs. 200
- LiPo 3.7V / 11.1V battery: Rs. 350 - Rs. 1,400 | 18650 Li-ion cells with BMS: Rs. 200 - Rs. 450
- Motor driver L298N / TB6612FNG: Rs. 90 - Rs. 220
- Sensors (Ultrasonic, MPU6050, IR, DHT22): Rs. 80 - Rs. 280 each
- Jumper wires + full breadboard: Rs. 120 - Rs. 220
- M3 stainless hardware kit (bolts, nuts, standoffs): Rs. 100 - Rs. 200
- Solder wire & flux: Rs. 150 - Rs. 250

Return this exact JSON structure:
{
  "project_name": "string (creative, modern project title)",
  "tagline": "string (1-sentence punchy summary)",
  "innovation_angle": "string (2-3 sentences explaining the smart, innovative, or advanced feature)",
  "difficulty": "beginner|intermediate|advanced",
  "total_estimated_time": "string (e.g. '16-22 lab hours across 3-4 weeks')",
  "total_estimated_cost": "string (e.g. 'Rs. 2,400 - Rs. 3,200')",
  "overview": "string (2-3 sentences: what is built, working principle, and practical use case)",

  "in_lab_equipment": [
    {
      "machine_id": "machine_id_from_provided_list",
      "name": "Machine Name",
      "role": "Specific role and part fabricated or tested on this machine"
    }
  ],

  "materials_to_buy": [
    {
      "item": "string (exact component name with rating/specs)",
      "quantity": "string (e.g. '1 unit' or '4 pieces')",
      "estimated_cost": "string (e.g. 'Rs. 450 - Rs. 550')",
      "where_to_buy": "string (e.g. 'Robu.in / ElectronicsComp / Local Market')",
      "why_needed": "string (purpose in the circuit or chassis)"
    }
  ],

  "missing_equipment": [
    {
      "item": "string",
      "workaround": "string (practical workaround or DIY alternative)"
    }
  ],

  "phases": [
    {
      "phase_number": 1,
      "title": "string (e.g. 'Phase 1: CAD Design & Mechanical Chassis Fabrication')",
      "duration": "string (e.g. '4-5 lab hours')",
      "machines": ["machine_id_from_provided_list"],
      "tools_needed": ["string"],
      "steps": [
        "string (deeply detailed step stating exact action + machine/tool settings/parameters + verification criteria)"
      ],
      "pro_tip": "string (practical engineering tip or common pitfall to avoid)"
    }
  ],

  "testing_and_calibration": [
    "string (step-by-step verification, multimeter test points, or calibration procedure)"
  ],

  "safety_notes": [
    "string (crucial safety notes and PPE rules specific to this build)"
  ]
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
    """Build a compact, token-efficient machine list grouped by lab."""
    grouped: dict[str, list[str]] = {}
    for mid, data in machines.items():
        lab_raw = data.get("lab", "unknown")
        lab = LAB_LABELS.get(lab_raw, lab_raw.replace("_", " ").title())
        name = data.get("name", mid)
        grouped.setdefault(lab, []).append(f"{name} (id: {mid})")

    lines = ["AVAILABLE LAB EQUIPMENT:"]
    for lab, entries in grouped.items():
        lines.append(f"[{lab}]: " + ", ".join(entries))
    return "\n".join(lines)


def _call_llm(project: str, machine_context: str) -> dict:
    """Call Groq and return a parsed plan dict."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY is not configured. Add it to backend/.env and restart."
        )

    model = os.getenv("GROQ_MODEL", "qwen/qwen3.6-27b")

    user_message = (
        f"{machine_context}\n\n"
        f"PROJECT IDEA: {project}\n\n"
        f"Output the complete JSON plan starting directly with {{. Include all phases and 4-5 detailed, numbered steps per phase."
    )

    payload = {
        "model":    model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_message},
        ],
        "temperature": 0.2,
        "max_tokens":  4096,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type":  "application/json",
    }

    timeout = httpx.Timeout(connect=10.0, read=90.0, write=10.0, pool=10.0)

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
                raise RuntimeError("Groq returned no choices.")
            content = choices[0].get("message", {}).get("content", "").strip()
            if not content:
                raise RuntimeError("Groq returned empty content.")

            # Strip reasoning/thinking tags emitted by Qwen
            content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
            if "<think>" in content:
                content = content.split("</think>")[-1] if "</think>" in content else re.sub(r"^<think>.*", "", content, flags=re.DOTALL)
            content = re.sub(r"^(?:Here'?s a thinking process:|\*\*Thinking Process:?\*\*)[\s\S]*?\n\n", "", content, flags=re.IGNORECASE).strip()

            # Extract JSON block even if preceded/followed by markdown commentary
            json_match = re.search(r"\{[\s\S]*\}", content)
            if json_match:
                content = json_match.group(0)
            else:
                # Strip markdown fences if the model wraps JSON despite instructions
                content = re.sub(r"^```(?:json)?\s*", "", content)
                content = re.sub(r"\s*```$", "", content)
                content = content.strip()

            # Parse JSON with automatic repair fallback
            try:
                plan = json.loads(content)
            except Exception as json_err:
                if json_repair:
                    try:
                        plan = json_repair.loads(content)
                    except Exception as repair_err:
                        raise HTTPException(status_code=500, detail=f"LLM returned invalid JSON: {repair_err}")
                else:
                    raise HTTPException(status_code=500, detail=f"LLM returned invalid JSON: {json_err}")

            if isinstance(plan, dict):
                return plan
            elif isinstance(plan, list) and len(plan) > 0 and isinstance(plan[0], dict):
                return plan[0]
            else:
                raise HTTPException(status_code=500, detail="LLM returned unexpected JSON structure")
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
