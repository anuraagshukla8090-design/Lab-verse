"""
LabVerse RAG — Embeddings  (backend/rag/embeddings.py)

Uses sentence-transformers for free, local, API-key-free embeddings.
Model: all-MiniLM-L6-v2
  - 384 dimensions
  - ~80 MB one-time download cached in ~/.cache/huggingface/
  - No API key or network call after first download
  - normalize_embeddings=True makes cosine similarity = dot product,
    which is required for Qdrant Cosine distance to work correctly.

Generation layer (rag/chat.py) is separate and uses OpenRouter.
These two layers are intentionally decoupled.
"""

import os

from functools import lru_cache
from sentence_transformers import SentenceTransformer

# Prevent sentence-transformers / transformers from making network calls
# on startup. The model is already fully cached after the first download.
# Without this, newer sentence-transformers versions attempt to fetch
# processor_config.json from HuggingFace, which fails if offline.
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")
os.environ.setdefault("HF_DATASETS_OFFLINE", "1")

EMBEDDING_MODEL = "all-MiniLM-L6-v2"
VECTOR_DIM      = 384


@lru_cache(maxsize=1)
def _get_model() -> SentenceTransformer:
    """
    Load and cache the model for the process lifetime.
    lru_cache ensures the ~80 MB model is loaded only once,
    regardless of how many embed_texts / embed_query calls are made.
    """
    return SentenceTransformer(EMBEDDING_MODEL, local_files_only=True)


def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Batch-embed document chunks for ingestion.
    Batching is significantly faster than embedding one-by-one.

    Args:
        texts: List of raw chunk strings from .md files

    Returns:
        List of 384-dimensional float vectors (one per input text)
    """
    model = _get_model()
    embeddings = model.encode(
        texts,
        normalize_embeddings=True,
        show_progress_bar=False,
        batch_size=32,
    )
    return embeddings.tolist()


def embed_query(text: str) -> list[float]:
    """
    Embed a single user query for retrieval.

    Args:
        text: User's natural-language question

    Returns:
        384-dimensional float vector
    """
    model = _get_model()
    return model.encode(text, normalize_embeddings=True).tolist()
