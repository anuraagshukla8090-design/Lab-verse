"""
LabVerse RAG — Embeddings  (backend/rag/embeddings.py)

Uses fastembed for lightweight, ONNX-based local embeddings.
Model: sentence-transformers/all-MiniLM-L6-v2
  - 384 dimensions — identical to the sentence-transformers version
  - Existing qdrant_storage vectors are fully compatible, no re-ingestion needed
  - ~50 MB RAM (ONNX runtime) vs ~350 MB RAM (PyTorch via sentence-transformers)
  - ~24 MB model download on first use, cached automatically by fastembed
  - No API key or network call after first download

fastembed is made by the Qdrant team and designed for production deployments
on memory-constrained servers (e.g. Render free tier: 512 MB).
"""

from functools import lru_cache
from fastembed import TextEmbedding

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
VECTOR_DIM      = 384


@lru_cache(maxsize=1)
def _get_model() -> TextEmbedding:
    """
    Load and cache the fastembed model for the process lifetime.
    lru_cache ensures the model is initialised only once regardless of
    how many embed_texts / embed_query calls are made.

    On first call fastembed downloads the ~24 MB ONNX model file to
    ~/.cache/fastembed/ and caches it for all subsequent runs.
    """
    return TextEmbedding(EMBEDDING_MODEL)


def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Batch-embed document chunks for ingestion.

    Args:
        texts: List of raw chunk strings from .md files

    Returns:
        List of 384-dimensional float vectors (one per input text)
    """
    model      = _get_model()
    embeddings = list(model.embed(texts))          # generator → list of numpy arrays
    return [e.tolist() for e in embeddings]


def embed_query(text: str) -> list[float]:
    """
    Embed a single user query for retrieval.

    Args:
        text: User's natural-language question

    Returns:
        384-dimensional float vector
    """
    model      = _get_model()
    embeddings = list(model.embed([text]))         # fastembed always takes an iterable
    return embeddings[0].tolist()
