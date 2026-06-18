import sys
sys.path.insert(0, 'C:/Users/itsga/Lab-verse/backend')

from rag.embeddings import embed_query
from rag.retriever import _get_client, COLLECTION
from qdrant_client.models import Filter, FieldCondition, MatchValue

machine_id = "vinyl_cutter"
queries = [
    "summarise",
    "explain",
    "explain with example"
]

client = _get_client()

print("=== RETRIEVAL THRESHOLD TRACE ===\n")

for q in queries:
    print(f"Query: '{q}'")
    print("-" * 50)
    
    query_vec = embed_query(q)
    response = client.query_points(
        collection_name=COLLECTION,
        query=query_vec,
        query_filter=Filter(
            must=[FieldCondition(key="machine_id", match=MatchValue(value=machine_id))]
        ),
        limit=8,
        with_payload=True,
    )
    
    scores = [r.score for r in response.points]
    
    for i, r in enumerate(response.points):
        print(f"  Chunk {i+1} | Score: {r.score:.4f} | Source: {r.payload['source']} | Index: {r.payload['chunk_index']}")
        
    pass_10 = len([s for s in scores if s >= 0.10])
    pass_35 = len([s for s in scores if s >= 0.35])
    
    print(f"\n  Threshold 0.10 -> Surviving chunks: {pass_10}  (LLM Called? {'YES' if pass_10 > 0 else 'NO'})")
    print(f"  Threshold 0.35 -> Surviving chunks: {pass_35}  (LLM Called? {'YES' if pass_35 > 0 else 'NO'})")
    print("\n" + "="*50 + "\n")
