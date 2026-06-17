import os
import time
import httpx
from dotenv import load_dotenv

load_dotenv()

# We need to test the RAG retrieval first
from rag.retriever import retrieve
from rag.chat import SYSTEM_PROMPT

machine_id = "vinyl_cutter"
question = "How does a vinyl cutter work?"

print("--- Retrieval Phase ---")
try:
    chunks = retrieve(machine_id, question, top_k=8)
    print(f"Retrieval Succeeded: {bool(chunks)}")
    print(f"Number of chunks retrieved: {len(chunks)}")
    for i, c in enumerate(chunks):
        print(f"  Chunk {i} score: {c['score']:.4f}")
except Exception as e:
    print(f"Retrieval Failed: {e}")
    chunks = []

if chunks:
    context_parts = [
        f"[Source: {c['source']} | chunk {c['chunk_index']}]\n{c['text']}"
        for c in chunks
    ]
    context = "\n\n---\n\n".join(context_parts)
else:
    context = "No context retrieved."

user_message = (
    f"--- DOCUMENTATION CONTEXT ---\n"
    f"{context}\n"
    f"--- END CONTEXT ---\n\n"
    f"Question: {question}"
)

api_key = os.getenv("OPENROUTER_API_KEY")
if not api_key:
    print("OPENROUTER_API_KEY NOT SET!")
    exit(1)

models = [
    "qwen/qwen-2.5-72b-instruct:free",
    "deepseek/deepseek-r1:free",
    "google/gemma-3-27b-it:free",
    "mistralai/mistral-small-3.2-24b-instruct:free",
    "meta-llama/llama-3.3-70b-instruct:free"
]

print("\n--- Testing Models ---")
timeout = httpx.Timeout(connect=5.0, read=25.0, write=5.0, pool=5.0)

for model in models:
    print(f"\nModel: {model}")
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_message},
        ],
        "temperature": 0.1,
        "max_tokens":  512,
    }
    
    start_time = time.time()
    try:
        with httpx.Client(timeout=timeout) as client:
            resp = client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type":  "application/json",
                    "HTTP-Referer":  "http://localhost:5173",
                    "X-Title":       "LabVerse",
                },
                json=payload,
            )
        
        latency = time.time() - start_time
        print(f"  HTTP Status: {resp.status_code}")
        print(f"  Response Latency: {latency:.2f}s")
        
        if resp.status_code == 429:
            print(f"  429 Error: YES")
            print(f"  Retry-After: {resp.headers.get('Retry-After', 'Not provided')}")
            print("  Success/Failure: FAILURE (Rate Limited)")
            print("  Valid Answer: NO")
        elif resp.status_code == 200:
            print("  429 Error: NO")
            print("  Success/Failure: SUCCESS")
            data = resp.json()
            if "choices" in data and len(data["choices"]) > 0:
                answer_text = data["choices"][0]["message"]["content"].strip()
                print("  Valid Answer: YES")
                print(f"  Answer preview: {answer_text[:100]}...")
            else:
                print("  Valid Answer: NO (No choices in response)")
                print(f"  Response body: {data}")
        else:
            print(f"  429 Error: NO")
            print(f"  Success/Failure: FAILURE (Status {resp.status_code})")
            print(f"  Body: {resp.text}")
            print("  Valid Answer: NO")
            
    except Exception as e:
        latency = time.time() - start_time
        print(f"  HTTP Status: N/A")
        print(f"  Response Latency: {latency:.2f}s")
        print(f"  429 Error: NO")
        print(f"  Success/Failure: FAILURE (Exception)")
        print(f"  Exception: {str(e)}")
        print("  Valid Answer: NO")
