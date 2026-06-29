"""
LabVerse RAG — Retriever  (backend/rag/retriever.py)

Fixes for qdrant-client >= 1.10:
  - client.search() removed → use client.query_points()
  - Singleton QdrantClient to avoid concurrent file-lock errors
    (local Qdrant storage allows only one open handle per process)
"""

from pathlib import Path
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue

from .embeddings import embed_query

COLLECTION           = "lab_docs"
QDRANT_PATH          = str(Path(__file__).parent.parent / "qdrant_storage")
CONFIDENCE_THRESHOLD = 0.10  # calibrated for all-MiniLM-L6-v2 (384-dim scores in 0.3–0.8 range)

# ---------------------------------------------------------------------------
# Singleton client — qdrant local storage does NOT support concurrent locks.
# Create once per process, reuse across all requests.
# ---------------------------------------------------------------------------
_client: QdrantClient | None = None


def _get_client() -> QdrantClient:
    global _client
    if _client is None:
        _client = QdrantClient(path=QDRANT_PATH)
    return _client


def retrieve(machine_id: str, question: str, top_k: int = 5) -> list[dict]:
    """
    Embed question, search Qdrant filtered by machine_id,
    apply confidence threshold, return surviving chunks.
    Returns [] if no chunks pass the threshold.

    Args:
        machine_id: Exact machines.json key  (e.g. "oscilloscope")
        question:   User's natural-language question
        top_k:      Max candidates before threshold filtering

    Returns:
        List of dicts: text, machine_id, source, chunk_id, chunk_index, score
    """
    client    = _get_client()
    query_vec = embed_query(question)

    # query_points replaces the removed search() in qdrant-client >= 1.10
    response = client.query_points(
        collection_name=COLLECTION,
        query=query_vec,
        query_filter=Filter(
            must=[
                FieldCondition(
                    key="machine_id",
                    match=MatchValue(value=machine_id),
                )
            ]
        ),
        limit=top_k,
        with_payload=True,
    )

    # Apply confidence threshold — discard low-quality context before LLM call
    confident = [r for r in response.points if r.score >= CONFIDENCE_THRESHOLD]

    return [
        {
            "text":        r.payload["text"],
            "machine_id":  r.payload["machine_id"],
            "source":      r.payload["source"],
            "chunk_id":    r.payload["chunk_id"],
            "chunk_index": r.payload["chunk_index"],
            "score":       round(r.score, 4),
        }
        for r in confident
    ]
