# LabVerse — Architecture

> Technical architecture documentation for Phase 1 and the planned evolution through Phases 2–4.

---

## System Overview

LabVerse uses a **decoupled client-server architecture**. The backend is the single source of truth for all data. The frontend is a pure display layer that fetches everything from the backend API on startup.

```
┌─────────────────────────────────────────────────────────┐
│                     BROWSER (User)                      │
│                                                         │
│   React 19 + Vite + TailwindCSS + Pannellum             │
│                                                         │
│   ┌────────────┐  ┌──────────────┐  ┌───────────────┐  │
│   │  Panorama  │  │   Machine    │  │  Navigation   │  │
│   │   Viewer   │  │    Sheet     │  │   Hotspots    │  │
│   └────────────┘  └──────────────┘  └───────────────┘  │
│            │               │                │           │
│            └───────────────┴────────────────┘           │
│                            │ api.js (fetch)             │
└────────────────────────────┼────────────────────────────┘
                             │ HTTP (JSON)
                             │
┌────────────────────────────▼────────────────────────────┐
│                  FastAPI Backend                         │
│                                                         │
│   GET /lab-config          GET /machines/{id}           │
│   GET /machines            GET /health                  │
│   GET /static/*                                         │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │              Data Layer (Phase 1)               │   │
│   │                                                 │   │
│   │   lab_config.json   machines.json               │   │
│   │   machine_content.json                          │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │              Static Assets                      │   │
│   │                                                 │   │
│   │   /static/panoramas/   /static/docs/            │   │
│   │   /static/machines/                             │   │
│   └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Design Principles

### 1. Backend as Single Source of Truth
All data lives in `backend/data/`. The frontend has zero hardcoded machine names, scene lists, or hotspot positions. Everything is fetched from the API on startup. Adding a new machine or scene requires **only a JSON edit** — no code changes.

### 2. API-First Architecture
The API contract (`/lab-config`, `/machines`, `/machines/{id}`) is **stable across all four phases**. Future phases (RAG, planner) extend what these endpoints *return* — they do not change the endpoints themselves. The frontend never needs to be rewritten to benefit from backend intelligence upgrades.

### 3. Separation of Content from Structure
Three JSON files serve distinct responsibilities:
- `lab_config.json` → **Where** things are (scene graph, hotspot positions)
- `machines.json` → **What** a machine is (metadata, skills, relationships)
- `machine_content.json` → **How** a machine is presented (description, specs, SOPs)

### 4. Incremental Phase Architecture
Each phase adds a new layer **without touching the previous layer**. This is enforced by the `merge_machine()` function in `main.py`, which is designed as the single injection point for new data sources.

### 5. Configuration Over Code
Add machines by editing JSON. Add scenes by editing JSON. Change hotspot positions by editing JSON. Never hardcode data in component files.

---

## Frontend Stack

| Technology | Version | Role |
|---|---|---|
| **React** | 19 | UI component framework |
| **Vite** | 8 | Build tool and dev server (port 5173) |
| **TailwindCSS** | 3.4 | Utility-first styling |
| **Shadcn/ui** | (Radix primitives) | Accessible UI components (Sheet, ScrollArea, etc.) |
| **Pannellum** | (CDN) | 360° equirectangular panorama renderer |
| **Lucide React** | 1.18 | Icon library |
| **class-variance-authority** | 0.7 | Variant-based class composition for Shadcn |

### Frontend File Structure

```
frontend/
├── src/
│   ├── App.jsx                     ← Root component (adds Router in Phase 2)
│   ├── main.jsx                    ← React DOM entry point
│   ├── index.css                   ← Global styles, Tailwind directives
│   ├── pages/
│   │   └── Home.jsx                ← Phase 1 single page, orchestrates all state
│   ├── components/
│   │   ├── PanoramaViewer.jsx      ← Pannellum 360° viewer + hotspot injection
│   │   ├── MachineHotspot.jsx      ← Clickable machine marker
│   │   ├── NavigationHotspot.jsx   ← Scene navigation arrow
│   │   ├── MachineSheet.jsx        ← Slide-out machine info panel
│   │   ├── LoadingScreen.jsx       ← Bootstrap loading state
│   │   └── ui/                     ← Shadcn/ui primitives
│   │       ├── badge.jsx
│   │       ├── button.jsx
│   │       ├── scroll-area.jsx
│   │       ├── separator.jsx
│   │       └── sheet.jsx
│   └── lib/
│       ├── api.js                  ← All fetch calls (add new ones here in future phases)
│       └── utils.js                ← clsx/tailwind-merge utility (cn function)
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── index.html
├── vite.config.js                  ← Path alias @/ → src/
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

### Data Flow (Phase 1)

```
App mounts
    │
    ▼
Home.jsx — useEffect bootstrap
    │
    ├── getLabConfig()  ─────────────► GET /lab-config
    └── getMachines()   ─────────────► GET /machines
                                           │
    ◄──────────────────────────────────────┘
    │  { labConfig, machines } stored in state
    │
    ├── PanoramaViewer renders current scene
    │       ├── NavigationHotspots (from scene.navigation[])
    │       └── MachineHotspots (from scene.machines[])
    │
    └── User clicks MachineHotspot
            │
            ▼
        MachineSheet opens with machines[machine_id] data
```

---

## Backend Stack

| Technology | Version | Role |
|---|---|---|
| **Python** | 3.10+ | Runtime |
| **FastAPI** | latest | REST API framework with async support |
| **Uvicorn** | latest (standard) | ASGI server |

### Backend File Structure

```
backend/
├── main.py                         ← FastAPI app, routes, merge logic
├── requirements.txt                ← fastapi, uvicorn[standard]
├── data/
│   ├── lab_config.json             ← Scene graph (source of truth for navigation)
│   ├── machines.json               ← Machine metadata and skill graph
│   └── machine_content.json        ← Machine display content (specs, SOPs)
└── static/
    ├── panoramas/                  ← 360° equirectangular JPG/PNG images
    │   └── entrance.JPG
    ├── docs/
    │   ├── cnc_01/                 ← PDFs: manual.pdf, sop.pdf
    │   ├── lathe_01/
    │   └── oscilloscope_01/
    └── machines/
        ├── cnc_01/                 ← Machine photos (JPG/PNG)
        ├── lathe_01/
        └── oscilloscope_01/
```

### API Endpoints

| Method | Endpoint | Phase | Description |
|---|---|---|---|
| `GET` | `/lab-config` | 1 | Full scene graph |
| `GET` | `/machines` | 1 | All machines (merged) |
| `GET` | `/machines/{machine_id}` | 1 | Single machine (merged) |
| `GET` | `/health` | 1 | Health check |
| `POST` | `/machines/{machine_id}/chat` | 2 | AI chat with RAG context (planned) |
| `GET` | `/machines/{machine_id}/similar` | 3 | Related machine recommendations (planned) |
| `POST` | `/planner` | 4 | Project planning agent (planned) |

---

## Phase 2 — RAG Architecture (Planned)

```
                        ┌─────────────────────┐
machine_id              │   ingest.py          │
docs/{machine_id}/  ───►│   Chunking           │
  manual.pdf            │   Embedding          │
  sop.pdf               │   (OpenAI/local)     │
                        └──────────┬──────────┘
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │   Qdrant            │
                        │   Vector Store      │
                        │   (per machine_id   │
                        │    collection)      │
                        └──────────┬──────────┘
                                   │
                        ┌──────────▼──────────┐
                        │   LangChain         │
                        │   Retrieval Chain   │
                        └──────────┬──────────┘
                                   │
                        ┌──────────▼──────────┐
                        │   FastAPI           │
         User query ───►│   /machines/{id}    │──► merged response
                        │   /chat endpoint    │    + retrieved context
                        └─────────────────────┘
```

The `merge_machine()` function in `main.py` is **the designed injection point** for adding retrieved context. No other code changes are needed in the API layer.

---

## Phase 3 — Lab Guide Architecture (Planned)

```
Student Profile (skills, history)
        │
        ▼
Machine Knowledge Graph (related_machines, skills_taught, skills_required)
        │
        ▼
Learning Path Engine
        │
        ▼
Guided Exploration UI (frontend recommendations layer)
```

---

## Phase 4 — Project Planner Architecture (Planned)

```
Project Description (natural language)
        │
        ▼
LLM + Structured Output Parsing
        │
        ▼
Machine Knowledge Graph traversal
        │
        ├── Required machines list
        ├── Skills to acquire (ordered)
        ├── Labs to visit (ordered)
        └── Estimated timeline
```

---

## Environment Configuration

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Backend base URL for all frontend fetches |

Set in a `.env` file in `frontend/` for custom deployments.

---

## Running Locally

```bash
# Terminal 1 — Backend
cd labverse/backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 2 — Frontend
cd labverse/frontend
npm install
npm run dev
```

Access at: `http://localhost:5173`
API docs at: `http://localhost:8000/docs`
