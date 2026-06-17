import os
import httpx
import time
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY")
if not api_key:
    print("OPENROUTER_API_KEY is not set!")
    exit(1)

# Fetch all models from OpenRouter
print("Fetching model list from OpenRouter...")
try:
    resp = httpx.get("https://openrouter.ai/api/v1/models")
    resp.raise_for_status()
    models_data = resp.json().get("data", [])
except Exception as e:
    print(f"Failed to fetch models: {e}")
    exit(1)

free_models = []
for model in models_data:
    pricing = model.get("pricing", {})
    # Check if prompt and completion price are 0
    try:
        prompt_price = float(pricing.get("prompt", 0))
        completion_price = float(pricing.get("completion", 0))
        if prompt_price == 0 and completion_price == 0:
            free_models.append(model.get("id"))
    except ValueError:
        pass

print(f"Found {len(free_models)} free models:")
for fm in free_models:
    print(f"  - {fm}")

# Define context and query for testing
context = """
[Source: docs/vinyl_cutter.md | chunk 0]
A vinyl cutter is a computer-controlled machine used to cut out shapes and letters from sheets of thin self-adhesive plastic (vinyl). The vinyl cutter is shaped like a computer printer, but instead of printing ink, it uses a very sharp micro-knife or blade to cut the shapes. The cutter moves the blade left and right (X-axis) while feeding the vinyl sheet forward and backward (Y-axis) through the machine.
"""
question = "How does a vinyl cutter work?"
user_message = (
    f"--- DOCUMENTATION CONTEXT ---\n"
    f"{context}\n"
    f"--- END CONTEXT ---\n\n"
    f"Question: {question}"
)
SYSTEM_PROMPT = "You are a laboratory assistant. Use the provided context as the source of truth."

timeout = httpx.Timeout(connect=5.0, read=25.0, write=5.0, pool=5.0)

# We will test the list of free models that we found, especially the ones that look like instruct/chat models
# Let's prioritize some common ones if we see them, or just test the first 5-10
test_list = [m for m in free_models if "instruct" in m or "chat" in m or "llama" in m or "qwen" in m or "gemma" in m or "mistral" in m]
if not test_list:
    test_list = free_models[:10]

print(f"\nTesting {len(test_list)} matching free models...")

for model in test_list:
    print(f"\nModel: {model}")
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_message},
        ],
        "temperature": 0.1,
        "max_tokens":  256,
    }
    
    start_time = time.time()
    try:
        with httpx.Client(timeout=timeout) as client:
            res = client.post(
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
        print(f"  HTTP Status: {res.status_code}")
        print(f"  Response Latency: {latency:.2f}s")
        if res.status_code == 200:
            data = res.json()
            if "choices" in data and len(data["choices"]) > 0:
                content = data["choices"][0]["message"]["content"].strip()
                print(f"  Success: YES")
                print(f"  Answer: {content[:100]}...")
            else:
                print(f"  Success: NO (no choices)")
        else:
            print(f"  Success: NO (Status {res.status_code})")
            print(f"  Body: {res.text}")
    except Exception as e:
        latency = time.time() - start_time
        print(f"  Success: NO (Exception)")
        print(f"  Latency: {latency:.2f}s")
        print(f"  Error: {e}")
