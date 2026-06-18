import os, httpx, time
from dotenv import load_dotenv
load_dotenv('C:/Users/itsga/Lab-verse/backend/.env', override=True)
key = os.getenv('OPENROUTER_API_KEY')

system_prompt = '''You are a laboratory assistant.

Use the provided context as the source of truth.

You may:
- simplify explanations
- provide analogies
- provide examples
- explain concepts for beginners
- explain step-by-step
- compare concepts

However, do not invent technical facts that are not supported by the retrieved context.

If the answer cannot be supported by the context, clearly state that the documentation does not contain that information.'''

user_message = '''--- DOCUMENTATION CONTEXT ---
[Source: oscilloscope_knowledge.md | chunk 42]
Bandwidth is the frequency at which the oscilloscope vertical amplifier attenuates a sinusoidal signal by 3 dB. Higher bandwidth oscilloscopes can measure higher frequency signals more accurately.
--- END CONTEXT ---

Question: Explain bandwidth with an analogy'''

models = [
    'google/gemma-4-31b-it:free',
    'qwen/qwen-2.5-72b-instruct:free',
    'deepseek/deepseek-r1:free'
]

print("=== RAW MODEL RESPONSES ===\n")

for model in models:
    print(f"Testing model: {model}")
    print("-" * 60)
    try:
        resp = httpx.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': model,
                'messages': [
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': user_message}
                ],
                'temperature': 0.1,
                'max_tokens': 512
            },
            timeout=30.0
        )
        if resp.status_code == 200:
            data = resp.json()
            content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
            print(content)
        else:
            print(f"FAILED: {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"ERROR: {e}")
    print("\n" + "=" * 60 + "\n")
    time.sleep(2)  # avoid rate limits