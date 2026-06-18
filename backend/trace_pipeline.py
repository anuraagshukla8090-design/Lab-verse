import sys
import os
import json
from pathlib import Path
from dotenv import load_dotenv

sys.path.insert(0, 'C:/Users/itsga/Lab-verse/backend')

# Load the env variables before running the trace
load_dotenv('C:/Users/itsga/Lab-verse/backend/.env', override=True)

from rag.embeddings import embed_query
from rag.retriever import _get_client, COLLECTION, CONFIDENCE_THRESHOLD
from rag.chat import answer as rag_answer
import httpx
from unittest.mock import patch

machine_id = "vinyl_cutter"
question = "Explain how a vinyl cutter works with an analogy"

print(f"=== TRACE: {machine_id} | {question} ===\n")

# 1. Manual retrieval trace (before filtering)
client = _get_client()
query_vec = embed_query(question)

from qdrant_client.models import Filter, FieldCondition, MatchValue

response = client.query_points(
    collection_name=COLLECTION,
    query=query_vec,
    query_filter=Filter(
        must=[
            FieldCondition(key="machine_id", match=MatchValue(value=machine_id))
        ]
    ),
    limit=8,
    with_payload=True,
)

print(f"1. Raw Qdrant Chunks Retrieved: {len(response.points)}")
print("-" * 60)
for i, r in enumerate(response.points):
    print(f"  Chunk {i+1} | Score: {r.score:.4f} | Source: {r.payload['source']} | Index: {r.payload['chunk_index']}")
    print(f"  Text preview: {r.payload['text'][:80].replace(chr(10), ' ')}...")
print("-" * 60)

# 2. Threshold Filtering
confident = [r for r in response.points if r.score >= CONFIDENCE_THRESHOLD]
print(f"\n2. Threshold: {CONFIDENCE_THRESHOLD}")
print(f"3. Chunks surviving threshold: {len(confident)}")

# 4-7. Intercept httpx to capture the exact prompt and response
original_post = httpx.Client.post

def mock_post(self, url, **kwargs):
    print("\n4. Final Context Assembled:")
    print("-" * 60)
    user_msg = kwargs['json']['messages'][1]['content']
    # split context from question
    if '--- END CONTEXT ---' in user_msg:
        context_part = user_msg.split('--- END CONTEXT ---')[0].strip()
        print(context_part[:500] + "\n...[truncated for display]...")
    else:
        print("NO CONTEXT")
    
    print("\n5. Exact Prompt Sent to OpenRouter:")
    print("-" * 60)
    prompt_copy = kwargs['json'].copy()
    prompt_copy['messages'][1]['content'] = prompt_copy['messages'][1]['content'][:300] + "...[truncated]..."
    print(json.dumps(prompt_copy, indent=2))
    
    print("\n6. Raw OpenRouter Response:")
    print("-" * 60)
    resp = original_post(self, url, **kwargs)
    try:
        data = resp.json()
        print(json.dumps(data, indent=2))
    except Exception as e:
        print(f"Failed to decode JSON: {resp.text}")
    return resp

print("\nExecuting live /chat pipeline...")
with patch.object(httpx.Client, 'post', new=mock_post):
    final_resp = rag_answer(machine_id, question)

print("\n7. Final Response Returned by /chat:")
print("-" * 60)
print(json.dumps(final_resp, indent=2))