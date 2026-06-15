# LabVerse — Engineering Decision Log

> A record of significant technical and architectural decisions made during LabVerse development.
> Future contributors and AI agents should read this before questioning or changing the architecture.

---

## How to Use This Document

Each decision is logged with:
- **Decision** — what was chosen
- **Reason** — why it was chosen
- **Tradeoffs** — what was given up and what future implications exist

When making a new significant decision, append it here before implementing.

---

## Decision Log

---

### ADR-001 — Pannellum over Three.js for 360° Viewing

**Date:** Phase 1 design
**Status:** Accepted

**Decision:**
Use [Pannellum](https://pannellum.org/) (a lightweight WebGL-based 360° panorama library) rather than Three.js for the immersive lab viewer.

**Reason:**
- Pannellum is purpose-built for equirectangular 360° photo display — the exact use case.
- Three.js requires building a custom panorama viewer from scratch (sphere geometry, texture mapping, camera controls, hotspot raycasting).
- Pannellum provides built-in hotspot support, keyboard/mouse/touch controls, and auto-loading — all for free.
- Zero WebGL expertise required for content team to add panoramas.
- Pannellum's API is stable and well-documented.

**Tradeoffs:**
- ⚠️ Less control over rendering pipeline than Three.js.
- ⚠️ No 3D object overlays (machines must be represented as 2D hotspot markers, not 3D models).
- ✅ 10× faster to implement.
- ✅ Works on all browsers, including mobile, without custom WebGL setup.
- ✅ Hotspot positioning (pitch/yaw) is well-understood and easy to configure in JSON.

**Future implication:** If the project ever needs 3D machine model overlays, a Three.js or Babylon.js refactor would be required. This is considered a Phase 5+ concern and is explicitly out of scope.

---

### ADR-002 — JSON Files over a Database

**Date:** Phase 1 design
**Status:** Accepted

**Decision:**
Store all lab configuration and machine data in flat JSON files (`lab_config.json`, `machines.json`, `machine_content.json`) rather than a SQL or NoSQL database.

**Reason:**
- The data is read-only at runtime in Phase 1. There are no writes, no transactions, no concurrency needs.
- JSON files are version-controllable in Git — every change to machine data is tracked, reviewable, and rollback-able.
- Zero infrastructure — no database server, no migration system, no ORM.
- Content editors (non-developers) can add machines by editing JSON in a GitHub UI or VS Code.
- The schema is stable enough to not require relational modeling.

**Tradeoffs:**
- ⚠️ No query language — filtering requires loading all data into memory and using Python dict operations.
- ⚠️ Does not scale to thousands of machines (acceptable; university lab inventory is typically 20–200 machines).
- ⚠️ No admin dashboard for non-technical content editing (a future consideration).
- ✅ No database setup required for new contributors.
- ✅ Git history is the audit trail.
- ✅ Data can be easily exported or migrated to a database in a future phase with a one-time script.

**Future implication:** If content editing by non-developers becomes important, a simple admin API backed by SQLite (or Supabase) could be introduced. The JSON files would become the initialization seed. This does not require changing the frontend API contract.

---

### ADR-003 — FastAPI over Flask or Django

**Date:** Phase 1 design
**Status:** Accepted

**Decision:**
Use FastAPI as the backend framework rather than Flask or Django.

**Reason:**
- FastAPI is async-native — essential for Phase 2 streaming AI chat responses.
- Automatic OpenAPI documentation at `/docs` is invaluable for frontend development and AI agent onboarding.
- Pydantic model validation will be useful in Phase 2+ when request bodies become complex.
- FastAPI has first-class support for streaming responses (Server-Sent Events, WebSocket) — needed for Phase 2.
- Static file serving is built-in via `StaticFiles`.
- Flask would require Quart for async, and Django is too heavy for a focused API service.

**Tradeoffs:**
- ⚠️ Less familiar to pure Django developers.
- ✅ Best Python framework for building an AI backend that will eventually stream LLM responses.
- ✅ Zero boilerplate for CORS, static serving, and JSON responses.

---

### ADR-004 — Backend as Single Source of Truth

**Date:** Phase 1 design
**Status:** Accepted — **Inviolable**

**Decision:**
All data lives in the backend (`backend/data/`). The frontend fetches everything from the API and stores nothing locally. Scene lists, machine names, hotspot positions, and all content come from the API exclusively.

**Reason:**
- Ensures consistency: if a machine is renamed, it changes everywhere simultaneously.
- Enables future AI enrichment: when Phase 2 adds RAG context to the `/machines/{id}` response, the frontend automatically benefits without any frontend code changes.
- Enables multi-deployment: the same frontend build can point to a different backend (via `VITE_API_URL`) for different labs.
- Prevents the classic "hardcoded frontend" anti-pattern where data is duplicated between frontend files and backend files.

**Tradeoffs:**
- ⚠️ The app shows a blank screen if the backend is unreachable (mitigated by the error state in `Home.jsx`).
- ⚠️ Initial load requires two API calls (mitigated by parallel fetch with `Promise.all`).
- ✅ Frontend components never need updating when content changes.
- ✅ A single data change propagates to all users immediately on next load.

**Agent Rule:** Do not move any data from `backend/data/` into the frontend. Do not hardcode machine names, scene names, or hotspot positions in any component file.

---

### ADR-005 — Phase-Based Development (No Big Bang)

**Date:** Phase 1 design
**Status:** Accepted

**Decision:**
Develop LabVerse in discrete, deployable phases rather than building all features simultaneously.

**Reason:**
- Phase 1 is a complete, useful product on its own. Students can use it before RAG is built.
- Each phase can be validated with real users before investing in the next layer.
- Reduces risk: if Phase 2 (RAG) proves unnecessary, Phase 1 is already valuable.
- Allows specialised contributors: a UX designer can work on Phase 1 while an ML engineer prepares Phase 2 infrastructure.

**Tradeoffs:**
- ⚠️ Requires upfront architectural discipline to make phases additive, not replacing.
- ✅ Always have a working, demonstrable product.
- ✅ Scope is bounded — each phase has a clear definition of done.

**Future implication:** Phase boundaries must be respected. Do not implement Phase 2 features in a Phase 1 branch. Do not require Phase 2 infrastructure to run Phase 1.

---

### ADR-006 — No LangGraph in MVP

**Date:** Phase 1 design
**Status:** Accepted

**Decision:**
Do not use LangGraph (or any multi-agent orchestration framework) in Phase 2. Use simple LangChain chains for RAG.

**Reason:**
- LangGraph introduces significant complexity: agent state machines, tool calling, planning loops.
- RAG for a single machine's documents does not require multi-agent orchestration.
- Simple `ConversationalRetrievalChain` or `RetrievalQA` chain is sufficient for Phase 2.
- LangGraph is appropriate for Phase 4 (Project Planner) where a multi-step planning agent is genuinely needed.

**Tradeoffs:**
- ⚠️ Phase 2 AI is less "agentic" — it retrieves and answers, but does not plan or use tools.
- ✅ Phase 2 implementation is simpler, faster, and more debuggable.
- ✅ LangGraph can be introduced in Phase 4 where its complexity is justified.

---

### ADR-007 — Isolated `merge_machine()` Function

**Date:** Phase 1 design
**Status:** Accepted — **Do not refactor away**

**Decision:**
Keep the `merge_machine()` function in `main.py` as the single isolated point where machine data sources are combined.

```python
def merge_machine(machine_id: str, metadata: dict, content: dict) -> dict:
    meta = metadata.get(machine_id)
    display = content.get(machine_id, {})
    return {"machine_id": machine_id, **meta, **display}
```

**Reason:**
This function is designed to grow. In Phase 2, it gains a third parameter: retrieved RAG context. In Phase 3, it gains `related_machines` expansion. If this logic is spread across multiple route handlers, Phase 2 changes become more complex.

**Tradeoffs:**
- ⚠️ Slightly unusual pattern — all routes call the same merge function.
- ✅ Phase 2 upgrade is a single function signature change, not a multi-file refactor.

**Agent Rule:** Do not inline `merge_machine()` logic directly into route handlers. Do not delete this function.

---

### ADR-008 — TailwindCSS over Vanilla CSS or CSS Modules

**Date:** Phase 1 design
**Status:** Accepted

**Decision:**
Use TailwindCSS v3 for all frontend styling rather than vanilla CSS or CSS Modules.

**Reason:**
- Shadcn/ui is built on Tailwind — using it is required to get Shadcn components working correctly.
- Utility-first approach is faster for building unique designs without naming every component class.
- Dark mode, glassmorphism effects, and responsive layouts are all first-class features in Tailwind.

**Tradeoffs:**
- ⚠️ JSX files become verbose with long class strings.
- ✅ Zero CSS file sprawl — styles live with components.
- ✅ `tailwind.config.js` provides a single design token file for colors, fonts, and animations.

---

### ADR-009 — Pannellum via CDN Script Injection (Not npm Package)

**Date:** Phase 1 design
**Status:** Accepted

**Decision:**
Load Pannellum via `<script>` and `<link>` tags injected dynamically in `PanoramaViewer.jsx` rather than installing it as an npm package.

**Reason:**
- The official Pannellum npm package has inconsistent React support and bundling issues.
- CDN injection is the officially supported Pannellum usage pattern.
- Avoids maintaining a complex Pannellum wrapper package.

**Tradeoffs:**
- ⚠️ Requires internet access during development (CDN load).
- ⚠️ Cannot version-lock Pannellum via `package.json`.
- ✅ Works reliably with React's lifecycle (script loaded before `pannellum.viewer()` is called in `useEffect`).
