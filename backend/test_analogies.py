import sys
import json
import os
sys.path.insert(0, 'C:/Users/itsga/Lab-verse/backend')

from dotenv import load_dotenv
load_dotenv('C:/Users/itsga/Lab-verse/backend/.env', override=True)

from rag.chat import answer as rag_answer
import httpx
from unittest.mock import patch

tests = [
    ("vinyl_cutter", "Explain how a vinyl cutter works with an analogy"),
    ("oscilloscope", "Explain bandwidth with an analogy")
]

original_post = httpx.Client.post

def make_mock(current_test):
    def mock_post(self, url, **kwargs):
        print(f"\n--- Raw OpenRouter Response for {current_test[0]} ---")
        resp = original_post(self, url, **kwargs)
        try:
            data = resp.json()
            if 'choices' in data and len(data['choices']) > 0:
                print(data['choices'][0]['message']['content'])
            else:
                print(f"Error: {data}")
        except Exception as e:
            print(f"Failed to decode JSON: {resp.text}")
        return resp
    return mock_post

for m_id, q in tests:
    print(f"\n{'='*60}\nTesting: {m_id} | {q}\n{'='*60}")
    
    with patch.object(httpx.Client, 'post', new=make_mock((m_id, q))):
        final_resp = rag_answer(m_id, q)
        
    print(f"\n--- Final /chat Response for {m_id} ---")
    print(json.dumps(final_resp, indent=2))