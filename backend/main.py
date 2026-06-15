"""
LabVerse Backend — Phase 1
FastAPI application serving lab configuration, machine metadata, and static assets.

API Contract (stable through all phases):
  GET /lab-config              → full scene graph with navigation + machine hotspots
  GET /machines                → all machines (metadata merged with content)
  GET /machines/{machine_id}   → single machine (metadata merged with content)

Future phases extend the data layer behind this same contract:
  Phase 2: merge() gains a third source → Qdrant vector results
  Phase 3: response gains `related_machines` expanded via graph
  Phase 4: response gains `project_suggestions` from planning agent
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json
from pathlib import Path

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="LabVerse API",
    description="Engineering Laboratory Intelligence Platform — Phase 1",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve panoramas, machine images, and docs under /static
STATIC_DIR = Path(__file__).parent / "static"
STATIC_DIR.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# ---------------------------------------------------------------------------
# Data helpers
# ---------------------------------------------------------------------------

DATA_DIR = Path(__file__).parent / "data"


def load_json(filename: str) -> dict:
    """Load a JSON file from the data directory."""
    filepath = DATA_DIR / filename
    if not filepath.exists():
        raise HTTPException(
            status_code=500,
            detail=f"Data file '{filename}' not found. Check backend/data/.",
        )
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def merge_machine(machine_id: str, metadata: dict, content: dict) -> dict:
    """
    Merge machine metadata and content into a single response object.

    This merge point is intentionally kept isolated so Phase 2 can inject
    a third source (e.g., retrieved document chunks from Qdrant) here
    without changing the API contract or the frontend.
    """
    meta = metadata.get(machine_id)
    if meta is None:
        raise HTTPException(
            status_code=404,
            detail=f"Machine '{machine_id}' not found in machines.json.",
        )
    display = content.get(machine_id, {})
    return {"machine_id": machine_id, **meta, **display}


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.get("/lab-config", tags=["Lab"])
async def get_lab_config():
    """
    Return the full scene graph: scenes, navigation hotspots, machine hotspots.
    Frontend reads this once on mount to build the navigation graph.
    Add scenes by editing backend/data/lab_config.json — no code changes needed.
    """
    return load_json("lab_config.json")


@app.get("/machines", tags=["Machines"])
async def get_machines():
    """
    Return all machines with metadata and content merged.
    Frontend fetches this once and keeps it in memory for fast hotspot lookups.
    """
    metadata = load_json("machines.json")
    content = load_json("machine_content.json")
    return {
        machine_id: merge_machine(machine_id, metadata, content)
        for machine_id in metadata
    }


@app.get("/machines/{machine_id}", tags=["Machines"])
async def get_machine(machine_id: str):
    """
    Return a single machine with metadata and content merged.
    Phase 2 will add retrieved document context to this response.
    """
    metadata = load_json("machines.json")
    content = load_json("machine_content.json")
    return merge_machine(machine_id, metadata, content)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


@app.get("/health", tags=["System"])
async def health():
    return {"status": "ok", "version": "1.0.0", "phase": 1}
