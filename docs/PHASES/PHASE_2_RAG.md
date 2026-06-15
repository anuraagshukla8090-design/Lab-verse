# Phase 2 — RAG-Powered Machine Chat

> **Status: 🔜 Planned — not yet implemented**
> This document describes the proposed architecture and implementation plan for Phase 2.
> Do not begin implementation until Phase 1 is fully complete (see `PHASES/PHASE_1.md`).

---

## Goal

Enable students to have a natural language conversation with any machine in the lab. Questions are answered using the machine's actual technical documentation (manuals, SOPs) via Retrieval-Augmented Generation (RAG).

**Example interaction:**
> Student: "What spindle speed should I use for aluminium on the CNC?"
> LabVerse: "For aluminium milling, the CNC manual recommends 2,000–4,000 RPM depending on the cutter diameter. For a 6mm end mill, start at 3,000 RPM with a feed rate of 500 mm/min..."

---

## Prerequisites (Must Be Complete Before Starting Phase 2)

- [ ] All machine PDF manuals are in `backend/static/docs/{machine_id}/manual.pdf`
- [ ] All machine SOPs are in `backend/static/docs/{machine_id}/sop.pdf`
- [ ] Phase 1 is fully functional (no broken scenes, no missing panoramas)
- [ ] At least 3 machines have complete documentation

---

## New Technologies

| Technology | Role |
|---|---|
| **Qdrant** | Vector database for storing document embeddings |
| **LangChain** | Retrieval chain orchestration |
| **OpenAI / Ollama** | Embedding model + LLM for answer generation |
| **`ingest.py`** | Document chunking and ingestion script |

---

## Architecture

### Document Pipeline (Offline — Run Once Per Machine)

```
backend/static/docs/{machine_id}/
    ├── manual.pdf
    └── sop.pdf
            │
            ▼
    ingest.py
            │
            ├── Load PDF with LangChain PyPDFLoader
            ├── Split into chunks (RecursiveCharacterTextSplitter)
            │       chunk_size=500, chunk_overlap=50
            ├── Embed each chunk (OpenAIEmbeddings or local model)
            └── Upsert into Qdrant
                    collection: machine_id
                    payload:
                        machine_id, chunk_index, source_file, page_number
```

### Retrieval Chain (Per Chat Request)

```
User message: "What probe attenuation for 5V signals?"
        │
        ▼
POST /machines/oscilloscope_01/chat
  { "message": "...", "history": [...] }
        │
        ▼
LangChain ConversationalRetrievalChain
        │
        ├── Embed user query
        ├── Search Qdrant collection "oscilloscope_01"
        │       top_k = 5 most similar chunks
        ├── Construct prompt:
        │       System: "You are a lab equipment expert for the Digital Oscilloscope."
        │       Context: [retrieved chunks]
        │       History: [conversation history]
        │       User: [current message]
        └── Stream LLM response
                │
                ▼
        Server-Sent Events (SSE) to frontend
```

### Data Flow Diagram

```
machine_id
    │
    ├──► backend/static/docs/{machine_id}/ ──► ingest.py ──► Qdrant Collection
    │                                                              │
    └──► machines.json                                            │
    └──► machine_content.json                                     │
            │                                                     │
            └────────────── merge_machine() ◄────────────────────┘
                                    │
                                    ▼
                          GET /machines/{machine_id}
                          POST /machines/{machine_id}/chat (NEW)
```

---

## API Changes

### New Endpoint: `POST /machines/{machine_id}/chat`

**Request:**
```json
{
  "message": "What probe attenuation should I use?",
  "history": [
    { "role": "user", "content": "How do I connect the probe?" },
    { "role": "assistant", "content": "Connect the BNC connector to CH1..." }
  ]
}
```

**Response:** Server-Sent Events (SSE) stream
```
data: {"token": "For"}
data: {"token": " a"}
data: {"token": " 5V"}
...
data: {"done": true, "sources": [{"file": "manual.pdf", "page": 12}]}
```

### Extended `GET /machines/{machine_id}` (Phase 1 contract preserved)

Phase 2 may optionally add a `has_rag` boolean field to the machine response:
```json
{
  "machine_id": "oscilloscope_01",
  "name": "Digital Oscilloscope",
  ...existing Phase 1 fields...,
  "has_rag": true
}
```
The frontend uses this to show/hide the chat UI. Phase 1 machines without ingested docs show `"has_rag": false`.

---

## Backend Files to Create

```
backend/
├── ingest.py               ← CLI script: python ingest.py --machine_id oscilloscope_01
├── rag/
│   ├── __init__.py
│   ├── vectorstore.py      ← Qdrant client initialization and collection management
│   ├── retriever.py        ← LangChain retriever factory per machine_id
│   └── chain.py            ← ConversationalRetrievalChain construction
└── requirements.txt        ← Add: qdrant-client, langchain, langchain-openai, pypdf
```

---

## Frontend Changes

### New Component: `MachineChat.jsx`

A chat interface rendered inside `MachineSheet` when `machine.has_rag === true`.

```
MachineSheet
    ├── [existing tabs: Overview, Specs, Safety, SOP]
    └── [new tab: Chat]
            └── MachineChat
                    ├── Message history (scrollable)
                    ├── Input field + send button
                    └── Streams SSE tokens into the UI
```

### Router Addition: `App.jsx`

Phase 2 introduces React Router to support a dedicated machine page URL (`/machines/oscilloscope_01`) for deep-linking and the chat interface.

```jsx
// App.jsx (Phase 2)
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import MachinePage from "@/pages/MachinePage";  // NEW

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/machines/:machineId" element={<MachinePage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## `ingest.py` — Proposed CLI Interface

```bash
# Ingest a single machine's documents
python ingest.py --machine_id oscilloscope_01

# Ingest all machines
python ingest.py --all

# Clear and re-ingest a machine
python ingest.py --machine_id cnc_01 --force
```

---

## Environment Variables (Phase 2 Additions)

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key for embeddings and LLM |
| `QDRANT_URL` | Qdrant server URL (default: `http://localhost:6333`) |
| `QDRANT_API_KEY` | Qdrant API key (if using Qdrant Cloud) |
| `EMBEDDING_MODEL` | Model name (default: `text-embedding-3-small`) |
| `CHAT_MODEL` | LLM model name (default: `gpt-4o-mini`) |

---

## `merge_machine()` Extension (Phase 2)

The **only change needed in `main.py`** for Phase 2 is adding a third data source to `merge_machine()`:

```python
# Phase 2 version of merge_machine
def merge_machine(machine_id: str, metadata: dict, content: dict) -> dict:
    meta = metadata.get(machine_id)
    display = content.get(machine_id, {})
    has_rag = qdrant_client.collection_exists(machine_id)   # NEW
    return {
        "machine_id": machine_id,
        **meta,
        **display,
        "has_rag": has_rag,                                 # NEW
    }
```

No other API changes are required.

---

## Success Criteria

- A student can ask a natural language question about any machine and receive an accurate, document-grounded answer.
- Responses cite the source document and page number.
- Conversation history is maintained within a session.
- The chat interface is accessible within the existing `MachineSheet` without navigating away.
- Phase 1 functionality is completely unaffected.
