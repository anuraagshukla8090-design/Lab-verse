# LabVerse — Current Status

> **This is the most important file for any AI agent or developer picking up this project.**
> Read this file first. It tells you exactly where the project stands and what to do next.

---

## Last Updated

**Date:** 2026-06-15
**Phase:** Phase 1 (Active)
**Git Branch:** `main`
**Commit:** Initial commit — full Phase 1 codebase

---

## Phase 1 — Implementation Checklist

### ✅ Completed

#### Infrastructure
- [x] Project monorepo structure: `labverse/frontend/` + `labverse/backend/`
- [x] Git repository initialized and pushed to GitHub
- [x] Root `.gitignore` covering `node_modules/`, `.venv/`, `dist/`, caches
- [x] `README.md` at project root

#### Backend (FastAPI)
- [x] FastAPI application (`backend/main.py`)
- [x] CORS middleware configured for Vite dev server (`localhost:5173`)
- [x] Static file serving mounted at `/static` (`backend/static/`)
- [x] `GET /lab-config` — returns full scene graph with navigation + machine hotspots
- [x] `GET /machines` — returns all machines (metadata + content merged)
- [x] `GET /machines/{machine_id}` — returns a single machine merged
- [x] `GET /health` — health check endpoint
- [x] JSON data loading helper (`load_json`)
- [x] Machine data merge function (`merge_machine`) — isolated for Phase 2 extension
- [x] `requirements.txt` with `fastapi` and `uvicorn[standard]`

#### Data Layer
- [x] `backend/data/lab_config.json` — scene graph with 3 scenes, navigation hotspots, machine placements
- [x] `backend/data/machines.json` — machine metadata for 3 machines (`oscilloscope_01`, `cnc_01`, `lathe_01`)
- [x] `backend/data/machine_content.json` — rich display content (descriptions, specs, safety, SOPs)
- [x] `machine_id` as universal key across all three JSON files

#### Static Asset Structure
- [x] `backend/static/panoramas/` — panorama images (`.JPG`)
- [x] `backend/static/docs/{machine_id}/` — placeholder `.gitkeep` files for manuals/SOPs
- [x] `backend/static/machines/{machine_id}/` — placeholder `.gitkeep` files for machine images
- [x] Future RAG folder structure pre-scaffolded (docs directories per machine)

#### Frontend (React + Vite)
- [x] Vite project scaffold with React 19
- [x] TailwindCSS v3 configured with PostCSS
- [x] Shadcn/ui component library integrated (Radix UI primitives)
- [x] Path alias `@/` configured in Vite for `src/`
- [x] `frontend/src/lib/api.js` — centralized API client with `VITE_API_URL` env support
- [x] `frontend/src/pages/Home.jsx` — root page orchestrating the full experience
- [x] `frontend/src/App.jsx` — root component (single-page, no router in Phase 1)

#### Frontend Components
- [x] `PanoramaViewer` — Pannellum-powered 360° viewer with hotspot injection
- [x] `MachineHotspot` — clickable machine marker rendered on the panorama
- [x] `NavigationHotspot` — clickable navigation arrow for scene transitions
- [x] `MachineSheet` — slide-out info panel showing machine details (Shadcn Sheet)
- [x] `LoadingScreen` — branded loading state shown during bootstrap fetch

#### UX / Design
- [x] Dark theme (`#080d14` base background)
- [x] Glassmorphism HUD elements (top bar, bottom control bar, legend)
- [x] LabVerse wordmark and logo in top bar
- [x] Scene name pill indicator (top right)
- [x] Scene selector dropdown (bottom left) with keyboard-accessible listbox
- [x] Machine/navigation hotspot legend (bottom right)
- [x] Error state with clear instructions to start the backend
- [x] Bootstrap data fetched in parallel (`Promise.all`) for minimal load time

---

### 🔄 In Progress

- [ ] Actual panorama images for `main_floor` and `electronics_corner` scenes
  - `entrance.JPG` exists; other scenes need real photos
- [ ] Machine images (`backend/static/machines/{machine_id}/`)
  - Placeholder folders exist; no images yet
- [ ] PDF manuals and SOPs (`backend/static/docs/{machine_id}/`)
  - Placeholder folders exist; no PDFs uploaded yet

---

### 🚫 Blocked

- Nothing is technically blocked. Asset uploads (panoramas, PDFs, machine images) depend on physical lab access and photography, which are outside the scope of the software.

---

### 📋 Next Steps (Priority Order)

1. **Upload real panorama images** for `main_floor` and `electronics_corner` to `backend/static/panoramas/`.
2. **Verify hotspot pitch/yaw values** against real panoramas — positions in `lab_config.json` are approximate and will need tuning per actual image.
3. **Upload machine images** to `backend/static/machines/{machine_id}/` and add paths to `machine_content.json` `images` array.
4. **Upload PDF manuals and SOPs** to `backend/static/docs/{machine_id}/` (paths already wired in `machine_content.json`).
5. **Add more machines** to `machines.json` and `machine_content.json` — no backend code changes needed.
6. **Add more lab scenes** to `lab_config.json` — no backend code changes needed.
7. **Begin Phase 2** (RAG integration) — see `docs/PHASES/PHASE_2_RAG.md`.

---

## Phase 2 — RAG + AI Chat

- [ ] `ingest.py` — document chunking and embedding pipeline
- [ ] Qdrant vector store setup and collection schema
- [ ] LangChain retrieval chain per machine
- [ ] `/machines/{machine_id}/chat` streaming endpoint
- [ ] Chat UI component in frontend
- [ ] React Router added to `App.jsx`

> See `docs/PHASES/PHASE_2_RAG.md` for full specification.

---

## Phase 3 — AI Lab Guide

- [ ] Learning path engine
- [ ] Skill gap analysis
- [ ] Related machine recommendations (graph-based)
- [ ] Guided exploration flow

> See `docs/PHASES/PHASE_3_GUIDE.md` for full specification.

---

## Phase 4 — Project Planner Agent

- [ ] Natural language project intake
- [ ] Project → machines mapping
- [ ] Project → skills workflow generation
- [ ] Lab booking recommendations

> See `docs/PHASES/PHASE_4_PLANNER.md` for full specification.
