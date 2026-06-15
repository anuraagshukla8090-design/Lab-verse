# LabVerse — Roadmap

> Phased development plan from MVP to full AI-powered lab intelligence platform.

---

## Overview

LabVerse is built in four deliberate phases. Each phase delivers a **complete, usable product** — not a half-built system. Later phases extend earlier ones without breaking them.

```
Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4
  360°         RAG         AI          Project
  Tours       + Chat      Guide       Planner
   ✅         🔜          🔜          🔜
```

---

## Phase 1 — Immersive Lab Explorer

**Status:** ✅ Complete
**Theme:** See the lab. Know the machines.

### Goal
Build the foundational product: an immersive, navigable 360° virtual lab tour with rich machine information accessible on demand.

### Deliverables

| Feature | Status |
|---|---|
| 360° equirectangular panorama viewer (Pannellum) | ✅ Done |
| Scene navigation (hotspots to move between lab areas) | ✅ Done |
| Machine hotspots (click to learn about equipment) | ✅ Done |
| Machine info sheet (description, specs, safety, SOP) | ✅ Done |
| FastAPI backend with JSON-driven data layer | ✅ Done |
| Static asset serving (panoramas, PDFs, images) | ✅ Done |
| Pre-scaffolded folder structure for RAG (Phase 2 prep) | ✅ Done |
| Real panorama images (all scenes) | 🔄 In Progress |
| Machine photos and PDF manuals | 🔄 In Progress |

### Success Criteria
A student can navigate the virtual lab, find any machine, and read its specs, safety requirements, and operating procedure — entirely without talking to a person.

---

## Phase 2 — RAG-Powered Machine Chat

**Status:** 🔜 Planned
**Theme:** Ask the machine anything.

### Goal
Add AI-powered chat for each machine, grounded in its actual manuals and SOPs through Retrieval-Augmented Generation (RAG). Students can ask natural language questions and get accurate, document-grounded answers.

### Deliverables

| Feature | Description |
|---|---|
| Document ingestion pipeline (`ingest.py`) | Chunk and embed PDFs per `machine_id` |
| Qdrant vector store | Store embeddings in per-machine collections |
| LangChain retrieval chain | Retrieve relevant chunks per query |
| `POST /machines/{machine_id}/chat` endpoint | Streaming AI response with RAG context |
| Frontend chat UI component | Inline chat within the MachineSheet |
| React Router | Navigate to `/machines/{id}` dedicated pages |

### Architecture Extension
The `merge_machine()` function in `main.py` gains a third data source: retrieved document chunks from Qdrant. The API contract for `GET /machines/{machine_id}` remains identical — the response simply gains a `context` field.

### Success Criteria
A student can ask "what probe attenuation should I use for a 5V signal?" and receive an accurate, cited answer sourced from the oscilloscope manual.

> See `docs/PHASES/PHASE_2_RAG.md` for full specification.

---

## Phase 3 — AI Lab Guide

**Status:** 🔜 Planned
**Theme:** Learn with guidance, not just information.

### Goal
Transform LabVerse from an information system into an active learning guide. The AI Lab Guide understands a student's current skills and goals, and recommends learning paths, related machines, and guided exploration sequences.

### Deliverables

| Feature | Description |
|---|---|
| Student skill profile | Track which machines a student has explored/used |
| Learning path engine | Recommend next machines based on skills gap |
| Related machine recommendations | Expand `related_machines` graph into UI |
| Guided exploration mode | Pre-defined learning sequences per skill domain |
| Skill badge system | Award micro-credentials for machine exploration |

### Success Criteria
A student who has explored the oscilloscope is proactively shown the function generator and multimeter as natural next steps, with a learning path toward full electronics bench competency.

> See `docs/PHASES/PHASE_3_GUIDE.md` for full specification.

---

## Phase 4 — Project Planning Agent

**Status:** 🔜 Planned
**Theme:** From idea to lab workflow.

### Goal
Give students a project-aware AI planning agent. A student describes their project ("I want to build a precision motor mount"), and the system generates a complete plan: which machines they need, in which labs, in which order, with which skills to acquire first.

### Deliverables

| Feature | Description |
|---|---|
| Natural language project intake | Free-text project description input |
| Project → machines mapping | LLM + graph traversal |
| Project → skills workflow | Ordered list of skills to acquire |
| Lab visit plan | Sequence of lab locations with machine assignments |
| PDF/shareable plan export | Download the generated plan |
| LMS integration (optional) | Push plan to Moodle/Canvas |

### Success Criteria
A student with no prior lab experience can describe a project and receive a complete, actionable lab plan in under 60 seconds — including which machines to learn, in which order, and what prerequisites to complete first.

> See `docs/PHASES/PHASE_4_PLANNER.md` for full specification.

---

## Timeline (Indicative)

| Phase | Estimated Duration | Primary Blocker |
|---|---|---|
| Phase 1 | Complete | Asset uploads (panoramas, PDFs) |
| Phase 2 | 4–6 weeks | Requires PDF manuals to exist |
| Phase 3 | 3–4 weeks | Requires Phase 2 machine data |
| Phase 4 | 6–8 weeks | Requires Phase 3 skill graph |

---

## Non-Goals (Intentional Exclusions)

These are features that LabVerse explicitly **will not** build in the foreseeable future:

- **3D/VR simulation** — real 360° photos are sufficient and far simpler to produce
- **Video streaming** — outside scope; YouTube embeds can supplement if needed
- **User authentication** — not required for MVP; add only if institution demands it
- **Native mobile app** — responsive web is sufficient; no app store dependency
- **Real-time machine status** — IoT integration is out of scope for academic MVP
