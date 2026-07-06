import os, httpx
from dotenv import load_dotenv
load_dotenv('C:/Users/itsga/Lab-verse/backend/.env', override=True)
key = os.getenv('OPENROUTER_API_KEY')
model = os.getenv('OPENROUTER_MODEL', 'google/gemma-4-31b-it:free')

print(f"API Key: {key[:12]}...{key[-4:] if key else 'NONE'}")
print(f"Model: {model}")
print()

resp = httpx.post(
    'https://openrouter.ai/api/v1/chat/completions',
    headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'},
    json={
        'model': model,
        'messages': [{'role': 'user', 'content': 'Say hello in one word.'}],
        'max_tokens': 10
    },
    timeout=20.0
)
print(f"HTTP Status: {resp.status_code}")
print(f"Response: {resp.text}")