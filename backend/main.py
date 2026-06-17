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

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from starlette.datastructures import MutableHeaders
from starlette.types import ASGIApp, Receive, Scope, Send
import json
from pathlib import Path

from dotenv import load_dotenv
_env_file = Path(__file__).resolve().parent / ".env"
load_dotenv(_env_file)   # absolute path — works regardless of uvicorn working directory

import logging
logger = logging.getLogger("labverse")

# ---------------------------------------------------------------------------
# Startup: pre-warm embedding model + Qdrant client so the first user
# question is never slow due to cold-start model loading.
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-load heavy resources before the server starts accepting requests."""
    logger.info("[startup] Loading embedding model...")
    from rag.embeddings import _get_model
    _get_model()           # loads all-MiniLM-L6-v2 into RAM and caches it
    logger.info("[startup] Embedding model ready.")

    logger.info("[startup] Opening Qdrant client...")
    from rag.retriever import _get_client
    _get_client()          # opens the file lock on qdrant_storage and caches it
    logger.info("[startup] Qdrant client ready.")

    logger.info("[startup] LabVerse is fully warmed up — ready to serve!")
    yield

# ---------------------------------------------------------------------------
# Pure-ASGI Cache-Control middleware
#
# Intercepts http.response.start (headers frame) for /static/ paths and
# injects Cache-Control without buffering the response body.
# BaseHTTPMiddleware is intentionally avoided here — it wraps streaming
# responses in a way that could buffer large file bodies into memory.
# ---------------------------------------------------------------------------

class CacheControlMiddleware:
    """
    Adds Cache-Control headers to static file responses.

    Panoramas / previews: max-age=86400 (24 h) — rarely change, safe to
    cache aggressively. Hard-refresh (Ctrl+Shift+R) bypasses if needed.
    Other static assets:   max-age=3600  (1 h)
    """

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path: str = scope.get("path", "")

        async def send_with_cache(message: dict) -> None:
            if message["type"] == "http.response.start":
                headers = MutableHeaders(scope=message)
                if (
                    path.startswith("/static/panoramas/")
                    or path.startswith("/static/previews/")
                ):
                    headers.append("Cache-Control", "public, max-age=86400")
                elif path.startswith("/static/"):
                    headers.append("Cache-Control", "public, max-age=3600")
            await send(message)

        await self.app(scope, receive, send_with_cache)

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="LabVerse API",
    description="Engineering Laboratory Intelligence Platform — Phase 1",
    version="1.0.0",
    lifespan=lifespan,
)

# Register Cache-Control middleware first (innermost — processes responses before CORS).
# Pure ASGI class, not BaseHTTPMiddleware, so large file streaming is never buffered.
app.add_middleware(CacheControlMiddleware)

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
    data = load_json("lab_config.json")
    return JSONResponse(content=data, headers={"Cache-Control": "public, max-age=30"})


@app.get("/machines", tags=["Machines"])
async def get_machines():
    """
    Return all machines with metadata and content merged.
    Frontend fetches this once and keeps it in memory for fast hotspot lookups.
    """
    metadata = load_json("machines.json")
    content = load_json("machine_content.json")
    result = {
        machine_id: merge_machine(machine_id, metadata, content)
        for machine_id in metadata
    }
    return JSONResponse(content=result, headers={"Cache-Control": "public, max-age=30"})


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
    return {"status": "ok", "version": "1.0.0", "phase": 2}


# ---------------------------------------------------------------------------
# Phase 2.1 — RAG chat endpoint
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    machine_id: str
    question:   str


@app.post("/chat", tags=["RAG"])
def chat(req: ChatRequest):
    """
    RAG pipeline: embed question → Qdrant retrieval (machine_id filter)
    → confidence threshold → OpenRouter LLM → grounded answer.

    Uses a synchronous `def` so FastAPI runs it in the thread pool,
    which is correct for blocking calls (sentence-transformers + Qdrant).

    Returns:
        answer, machine_id, chunks_used, sources[]
    """
    # Import here to avoid loading sentence-transformers at server startup
    # (the model downloads ~80 MB on first use and is then cached locally).
    from rag.chat import answer as rag_answer

    try:
        result = rag_answer(req.machine_id, req.question)
        return JSONResponse(content=result)

    except ValueError as exc:
        # Raised when OPENROUTER_API_KEY is missing
        raise HTTPException(status_code=503, detail=str(exc))

    except Exception as exc:
        msg = str(exc).lower()
        if "collection" in msg and ("not found" in msg or "doesn't exist" in msg):
            raise HTTPException(
                status_code=503,
                detail=(
                    "Knowledge base not initialised. "
                    "Run:  python ingest.py  inside the backend folder."
                ),
            )
        raise HTTPException(status_code=500, detail=str(exc))
