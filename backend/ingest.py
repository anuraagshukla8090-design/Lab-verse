"""
LabVerse Document Ingestion — Phase 2.1  (backend/ingest.py)

Reads machine knowledge markdown files from:
    backend/static/docs/{machine_id}/{machine_id}_knowledge.md

Source of truth for valid machine_ids: backend/data/machines.json

Chunks each document with RecursiveCharacterTextSplitter,
embeds with sentence-transformers (all-MiniLM-L6-v2, local/free),
and upserts into Qdrant collection "lab_docs".

Usage:
    python ingest.py                        # ingest all 15 machines
    python ingest.py --machine oscilloscope # ingest one machine only
    python ingest.py --recreate             # drop + recreate collection first

The script is idempotent: re-running without --recreate deletes existing
chunks for each target machine before re-inserting (safe to run repeatedly).
"""

import argparse
import json
import uuid
from pathlib import Path

from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    FilterSelector,
    MatchValue,
    PointStruct,
    VectorParams,
)

from rag.embeddings import EMBEDDING_MODEL, VECTOR_DIM, embed_texts

load_dotenv()

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

BASE_DIR      = Path(__file__).parent
DOCS_DIR      = BASE_DIR / "static" / "docs"
DATA_DIR      = BASE_DIR / "data"
QDRANT_PATH   = str(BASE_DIR / "qdrant_storage")
COLLECTION    = "lab_docs"
CHUNK_SIZE    = 800
CHUNK_OVERLAP = 150

splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
    # Split at section headings first, then paragraphs, then lines
    separators=["\n## ", "\n### ", "\n\n", "\n", " "],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_machine_ids() -> list[str]:
    """Return all machine_ids from machines.json (the single source of truth)."""
    with open(DATA_DIR / "machines.json", encoding="utf-8") as f:
        return sorted(json.load(f).keys())


def get_client() -> QdrantClient:
    return QdrantClient(path=QDRANT_PATH)


def ensure_collection(client: QdrantClient, recreate: bool = False) -> None:
    existing = [c.name for c in client.get_collections().collections]

    if recreate and COLLECTION in existing:
        client.delete_collection(COLLECTION)
        print(f"  [OK] Dropped collection '{COLLECTION}'")
        existing = []

    if COLLECTION not in existing:
        client.create_collection(
            collection_name=COLLECTION,
            vectors_config=VectorParams(size=VECTOR_DIM, distance=Distance.COSINE),
        )
        print(f"  [OK] Created collection '{COLLECTION}'  (dim={VECTOR_DIM}, Cosine)")
    else:
        print(f"  [OK] Collection '{COLLECTION}' exists -- will upsert")


def delete_machine_chunks(client: QdrantClient, machine_id: str) -> None:
    """Remove all existing chunks for a machine (makes re-ingestion idempotent)."""
    try:
        client.delete(
            collection_name=COLLECTION,
            points_selector=FilterSelector(
                filter=Filter(
                    must=[
                        FieldCondition(
                            key="machine_id",
                            match=MatchValue(value=machine_id),
                        )
                    ]
                )
            ),
        )
    except Exception:
        pass  # Collection may be freshly created — nothing to delete


def ingest_file(client: QdrantClient, md_path: Path, machine_id: str) -> int:
    """
    Chunk, batch-embed, and upsert a single .md file.

    Batch embedding is significantly faster than embedding chunk-by-chunk
    because the transformer model processes multiple sequences in parallel.

    Returns the number of chunks stored.
    """
    raw_text = md_path.read_text(encoding="utf-8")
    chunks   = splitter.split_text(raw_text)

    if not chunks:
        return 0

    # Batch-embed all chunks at once
    vectors = embed_texts(chunks)

    points = [
        PointStruct(
            id=str(uuid.uuid4()),   # UUID string — also stored as chunk_id in payload
            vector=vector,
            payload={
                "machine_id":  machine_id,
                "source":      md_path.name,
                "chunk_id":    str(uuid.uuid4()),  # separate field for traceability
                "chunk_index": i,
                "text":        chunk_text,
            },
        )
        for i, (chunk_text, vector) in enumerate(zip(chunks, vectors))
    ]

    client.upsert(collection_name=COLLECTION, points=points)
    return len(points)


# ---------------------------------------------------------------------------
# Main ingestion runner
# ---------------------------------------------------------------------------

def run(machine_filter: str | None = None, recreate: bool = False) -> None:
    print("=" * 55)
    print("  LabVerse Ingestion — Phase 2.1")
    print("=" * 55)
    print(f"  Embedding model  :  {EMBEDDING_MODEL}  ({VECTOR_DIM}-dim)")
    print(f"  Qdrant path      :  {QDRANT_PATH}")
    print(f"  Collection       :  {COLLECTION}")
    print(f"  Chunk size       :  {CHUNK_SIZE}   overlap: {CHUNK_OVERLAP}")
    print()

    # Load valid machine_ids from source of truth
    all_machine_ids = load_machine_ids()

    if machine_filter:
        if machine_filter not in all_machine_ids:
            print(f"ERROR: '{machine_filter}' not found in machines.json")
            print(f"  Valid IDs: {', '.join(all_machine_ids)}")
            return
        target_ids = [machine_filter]
    else:
        target_ids = all_machine_ids

    client = get_client()
    ensure_collection(client, recreate=recreate)
    print()

    ingested  = []
    skipped   = []
    total_chunks = 0

    for machine_id in target_ids:
        doc_folder = DOCS_DIR / machine_id

        # ── Check 1: does the docs folder exist? ──────────────────────────
        if not doc_folder.exists():
            print(f"  [SKIP]    {machine_id}  —  no docs folder at docs/{machine_id}/")
            skipped.append(machine_id)
            continue

        # ── Check 2: are there valid .md files? (skip .gitkeep etc.) ──────
        md_files = [
            f for f in doc_folder.glob("*.md")
            if f.stat().st_size > 200   # skip empty placeholders
        ]

        if not md_files:
            print(f"  [SKIP]    {machine_id}  --  no valid .md files in docs/{machine_id}/")
            skipped.append(machine_id)
            continue

        # -- Ingest ------------------------------------------------------
        print(f"  [INGEST] {machine_id}")

        # Remove old chunks first (idempotent re-run)
        if not recreate:
            delete_machine_chunks(client, machine_id)

        machine_total = 0
        for md_path in sorted(md_files):
            n = ingest_file(client, md_path, machine_id)
            print(f"    -> {md_path.name}  :  {n} chunks")
            machine_total += n

        total_chunks += machine_total
        ingested.append(machine_id)

    # ── Final report ────────────────────────────────────────────────────
    info = client.get_collection(COLLECTION)
    print()
    print("=" * 55)
    print("  INGESTION COMPLETE")
    print("=" * 55)
    print(f"  Machines ingested  :  {len(ingested)} / {len(target_ids)}")
    print(f"  Chunks this run    :  {total_chunks}")
    print(f"  Total Qdrant pts   :  {info.points_count}")

    if skipped:
        print(f"\n  Skipped ({len(skipped)}): {', '.join(skipped)}")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="LabVerse — ingest machine knowledge docs into Qdrant"
    )
    parser.add_argument(
        "--machine",
        help="Ingest only this machine_id (must exist in machines.json)",
    )
    parser.add_argument(
        "--recreate",
        action="store_true",
        help="Drop and recreate the Qdrant collection before ingesting",
    )
    args = parser.parse_args()
    run(machine_filter=args.machine, recreate=args.recreate)
