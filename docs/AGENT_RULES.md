# LabVerse — Agent Rules

> **READ THIS FIRST.** These are the non-negotiable rules for any AI coding agent, developer, or contributor working on LabVerse.
> These rules exist to protect architectural decisions that took significant deliberate effort to get right.
> Violating these rules will create technical debt that is difficult to undo.

---

## Who This Applies To

These rules apply to every AI coding agent working on this codebase, including but not limited to:
- Antigravity (Google DeepMind)
- Claude (Anthropic)
- Cursor Agent
- GitHub Copilot Agent
- Windsurf / Cascade
- GPT-4o (OpenAI)
- Gemini (Google)
- Any future model or tool

---

## Non-Negotiable Rules

---

### Rule 1 — Do Not Rewrite the Architecture

The architecture was designed deliberately and documented in `ARCHITECTURE.md`. It is:
- A decoupled frontend + backend
- FastAPI serving JSON + static assets
- React consuming a backend API

**Do not:**
- Convert to a monolith
- Merge frontend and backend into a single Next.js app
- Replace FastAPI with Express or any other framework without an ADR in `DECISIONS.md`
- Flatten the `frontend/` / `backend/` folder structure

---

### Rule 2 — Do Not Move JSON Data Into the Frontend

All data lives in `backend/data/`. This is the **single source of truth**.

**Do not:**
- Copy machine data into any frontend file (`src/data/`, hardcoded arrays, constants files)
- Hardcode machine names, scene IDs, hotspot positions, or skill lists in any component
- Create a frontend `machines.js` or `scenes.js` file with static data

If a component needs data, it gets it from `api.js` → backend API.

---

### Rule 3 — Backend Remains the Single Source of Truth

The frontend is a display layer. It has no opinions about what machines exist or where they are.

**Enforced by:** `getLabConfig()` and `getMachines()` fetched on startup in `Home.jsx`.

**Do not:**
- Add any static data to `Home.jsx`, `PanoramaViewer.jsx`, `MachineSheet.jsx`, or any other component
- Skip the API and return data directly from frontend code

---

### Rule 4 — Preserve `machine_id` Relationships

`machine_id` is the universal key. It must be consistent across:
- `lab_config.json` (hotspot references)
- `machines.json` (machine metadata)
- `machine_content.json` (display content)
- `backend/static/docs/{machine_id}/` (document folders)
- `backend/static/machines/{machine_id}/` (image folders)
- Qdrant collection names (Phase 2)
- Any future database records (Phase 3+)

**Do not:**
- Rename a `machine_id` in one file without renaming it everywhere
- Use display names (e.g., "CNC Machine") as keys — use the `machine_id` slug
- Create inconsistent keys across the three JSON files

---

### Rule 5 — Build Incrementally, Phase by Phase

Each phase must be independently deployable. Phase 2 work must not break Phase 1. Phase 3 must not require Phase 2 to be complete to develop Phase 3 UI mocks.

**Do not:**
- Begin implementing Phase 2 (RAG, Qdrant, LangChain) until Phase 1 assets (panoramas, PDFs) are uploaded and verified
- Add Phase 3 UI components to Phase 1 branches without a feature flag or separate route
- Mix phase concerns in a single commit or PR

---

### Rule 6 — Avoid Overengineering

LabVerse is an academic lab intelligence platform. It does not need:
- Microservices
- Kubernetes
- GraphQL
- Event sourcing / CQRS
- Real-time WebSocket data feeds for Phase 1
- Complex caching layers in Phase 1

**Do not:**
- Add infrastructure complexity without a documented reason in `DECISIONS.md`
- Introduce a dependency that solves a problem that does not yet exist

---

### Rule 7 — Prefer Configuration Over Hardcoded Logic

New machines, scenes, and content should be addable by editing JSON — not by writing code.

**Do not:**
- Write `if machine_id === 'cnc_01'` logic anywhere
- Add machine-specific rendering logic to components
- Hardcode scene names in navigation components

If a new feature requires machine-specific behavior, add a new field to `machines.json` and read it generically in the component.

---

### Rule 8 — Respect Phase Boundaries

The `merge_machine()` function in `main.py` is the designated extension point for future phases. It is intentionally isolated.

**Do not:**
- Inline merge logic into individual route handlers
- Delete or rename `merge_machine()`
- Add Phase 2 RAG retrieval calls anywhere other than inside `merge_machine()`

When Phase 2 arrives, `merge_machine()` gains a third parameter: retrieved document context. This is the only change needed in the API layer.

---

### Rule 9 — Do Not Break the API Contract

These three endpoints are stable across all four phases:

```
GET /lab-config
GET /machines
GET /machines/{machine_id}
```

Future phases **extend the response shape** of these endpoints. They do not change endpoint URLs, HTTP methods, or remove existing response fields.

**Do not:**
- Change these endpoint URLs
- Remove fields from existing API responses
- Require the frontend to call new Phase 2 endpoints to display Phase 1 content

---

### Rule 10 — Document Significant Decisions

If you make an architectural decision that isn't covered by existing rules — choosing a new library, changing a data schema, adding a new folder structure — add an entry to `DECISIONS.md` before or alongside the code change.

Format:

```markdown
### ADR-XXX — [Decision Title]

**Date:** YYYY-MM-DD
**Status:** Accepted

**Decision:** ...
**Reason:** ...
**Tradeoffs:** ...
```

---

## Quick Reference — Allowed vs. Not Allowed

| Action | Allowed? |
|---|---|
| Add a new machine by editing JSON files | ✅ Yes |
| Add a new scene by editing `lab_config.json` | ✅ Yes |
| Add a new field to `machines.json` schema | ✅ Yes (update `DATA_SCHEMAS.md` too) |
| Add a new API endpoint for Phase 2+ | ✅ Yes (follow API contract rules) |
| Add new React components to `src/components/` | ✅ Yes |
| Add new pages to `src/pages/` | ✅ Yes (add React Router when needed) |
| Hardcode machine data in a component | ❌ No |
| Move JSON files to `frontend/` | ❌ No |
| Delete `merge_machine()` | ❌ No |
| Skip backend and fetch data from a CDN | ❌ No |
| Rename `machine_id` in one file only | ❌ No |
| Add a database in Phase 1 | ❌ No |
| Change the API endpoint URLs | ❌ No |

---

## Reading Order for a New Agent

1. `docs/AGENT_RULES.md` ← you are here
2. `docs/CURRENT_STATUS.md` ← what's done, what's next
3. `docs/ARCHITECTURE.md` ← how it's built
4. `docs/DATA_SCHEMAS.md` ← the data model
5. `docs/DECISIONS.md` ← why it's built this way
6. `docs/PHASES/PHASE_1.md` ← Phase 1 specifics
7. `docs/ROADMAP.md` ← where it's going
