import sys
sys.path.insert(0, 'C:/Users/itsga/Lab-verse/backend')

from rag.chat import SYSTEM_PROMPT

chunks = [
    {
        'source': 'oscilloscope_knowledge.md',
        'chunk_index': 42,
        'text': 'Bandwidth is the frequency at which the oscilloscope vertical amplifier attenuates a sinusoidal signal by 3 dB. Higher bandwidth oscilloscopes can measure higher frequency signals more accurately.',
    }
]

question = 'Explain bandwidth with an analogy'

context_parts = [
    f"[Source: {c['source']} | chunk {c['chunk_index']}]\n{c['text']}"
    for c in chunks
]
context = '\n\n---\n\n'.join(context_parts)

user_message = (
    f"--- DOCUMENTATION CONTEXT ---\n"
    f"{context}\n"
    f"--- END CONTEXT ---\n\n"
    f"Question: {question}"
)

print('\n=== EXACT PAYLOAD SENT TO LLM ===\n')
print('1. System Prompt:')
print('-' * 80)
print(SYSTEM_PROMPT)
print('-' * 80)

print('\n2. User Message (includes retrieved context and original question):')
print('-' * 80)
print(user_message)
print('-' * 80)