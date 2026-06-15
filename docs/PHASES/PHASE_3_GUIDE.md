# Phase 3 — AI Lab Guide

> **Status: 🔜 Planned — not yet implemented**
> This document describes the proposed vision and architecture for Phase 3.
> Phase 3 builds on Phase 2 (RAG) and the machine knowledge graph established in Phase 1.

---

## Goal

Transform LabVerse from a passive information system into an **active learning partner**. The AI Lab Guide knows what a student has explored, understands their skill level, and proactively guides them toward new machines, related equipment, and structured learning paths.

**Vision:**
> A student finishes reading about the oscilloscope. The AI Lab Guide says: "Since you've explored the oscilloscope, the function generator is your natural next step — it produces the signals you'll measure. Want me to guide you through the Electronics Bench workflow?"

---

## Core Concepts

### Student Skill Profile
A lightweight representation of what a student knows and has explored:
```json
{
  "explored_machines": ["oscilloscope_01"],
  "known_skills": ["basic_electronics"],
  "learning_path": "electronics_bench"
}
```

In Phase 3 MVP, this is stored client-side (localStorage) or in a simple backend session. A full user database is explicitly out of scope for Phase 3.

### Machine Knowledge Graph
Already encoded in `machines.json`:
- `skills_required` — prerequisites
- `skills_taught` — what you learn
- `related_machines` — adjacent equipment
- `complexity_level` — beginner / intermediate / advanced

Phase 3 traverses this graph to generate recommendations.

### Learning Paths
Pre-defined sequences of machines organized by skill domain. Stored as configuration (JSON), not hardcoded.

```json
{
  "electronics_bench": {
    "name": "Electronics Workbench",
    "description": "Master the core instruments of an electronics lab",
    "machines": [
      "multimeter_01",
      "oscilloscope_01",
      "function_generator_01",
      "power_supply_01",
      "spectrum_analyzer_01"
    ]
  },
  "cnc_fabrication": {
    "name": "CNC Fabrication",
    "machines": ["lathe_01", "cnc_01", "bandsaw_01", "drill_press_01"]
  }
}
```

---

## Proposed Features

### Feature 1 — Related Machine Recommendations

When a student views a machine, the `MachineSheet` shows:

```
[Machine: Oscilloscope]
──────────────────────────────────
📌 You might also need:
  → Function Generator (produces signals to measure)
  → Multimeter (complementary bench tool)
  → Spectrum Analyzer (advanced signal analysis)
```

**Implementation:**
- Read `related_machines[]` from the machine object (already in `machines.json`)
- Fetch those machines from the already-loaded `machines` state (no new API call)
- Render as clickable cards that open the related machine's sheet

**This feature requires zero new backend code** — it's a frontend rendering change using existing data.

### Feature 2 — Skill Gap Indicator

Show the student which skills they need before they can use a machine:

```
[Machine: CNC Milling Machine]  ← complexity: intermediate
──────────────────────────────────
⚠️ Skills Required:
  ✅ cad_basics         (you have this)
  ❌ g_code             (you need this)
  ❌ material_selection (you need this)

→ Learn G-Code first: [Lathe Guide] or [CNC Programming Tutorial]
```

**Implementation:**
- Student profile (explored machines + skills) stored in localStorage
- Compare `skills_required[]` against profile's `known_skills[]`
- Show gap in the MachineSheet UI

### Feature 3 — Learning Path Mode

A guided exploration mode where the student selects a learning path and LabVerse walks them through each machine in sequence:

```
Learning Path: Electronics Workbench (5 machines)
──────────────────────────────────────────────────
✅ 1. Multimeter         (completed)
→  2. Oscilloscope       (current — you are here)
   3. Function Generator
   4. Power Supply
   5. Spectrum Analyzer

Progress: ██████░░░░ 40%
```

**Implementation:**
- `learning_paths.json` configuration file in `backend/data/`
- `GET /learning-paths` API endpoint (new, Phase 3)
- `LearningPathPanel` React component (new, Phase 3)
- Progress tracked in localStorage

### Feature 4 — Guided Exploration Narration (AI-Enhanced)

Extends Phase 2 RAG chat with contextual narration based on the learning path:

When a student enters a new scene, the AI Lab Guide proactively explains:
- What machines are in this scene
- Which ones are relevant to their current learning path
- What skills they'll gain from each

**Implementation:**
- `POST /guide/narrate` endpoint: takes `{ scene_id, student_profile }` → returns narration text
- Uses Phase 2 LLM infrastructure
- Rendered as a subtle overlay when entering a new scene

### Feature 5 — Skill Badge System

Visual recognition for machine exploration milestones:

```
🎖️ Earned: "Electronics Explorer" — explored all Electronics Lab machines
🎖️ Earned: "Oscilloscope Operator" — completed oscilloscope learning path
```

**Implementation:**
- Badge definitions in `backend/data/badges.json`
- Awarded client-side based on localStorage skill profile
- Displayed in a "Achievements" panel

---

## New API Endpoints (Phase 3)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/learning-paths` | All available learning paths |
| `GET` | `/learning-paths/{path_id}` | Single learning path with machine details |
| `GET` | `/machines/{machine_id}/related` | Related machines with relationship context |
| `POST` | `/guide/narrate` | AI narration for a scene or machine |

---

## Frontend Changes (Phase 3)

### New Components

| Component | Purpose |
|---|---|
| `LearningPathPanel.jsx` | Sidebar showing learning path progress |
| `SkillGapIndicator.jsx` | Visual prereq checker in MachineSheet |
| `RelatedMachinesPanel.jsx` | "You might also need" section in MachineSheet |
| `SkillBadges.jsx` | Badge display in a user profile sidebar |
| `GuideNarration.jsx` | Contextual AI narration overlay |

### New Pages

| Page | Route | Purpose |
|---|---|---|
| `LearningPathsPage.jsx` | `/learn` | Browse all learning paths |
| `ProfilePage.jsx` | `/profile` | Student skill profile and badges |

---

## Phase 3 Non-Goals

- **No user authentication** — skill profiles are localStorage-based (opt-in persistence)
- **No LMS integration** — defer to Phase 4+
- **No AI agent loops** — narration is a single LLM call, not an orchestrated agent
- **No real-time multiplayer** — no collaborative features

---

## Success Criteria

- A student exploring for the first time can follow a learning path from zero to all machines in a domain.
- A student who has used the oscilloscope is shown the function generator as a natural next step.
- A student can see exactly which skills they're missing before approaching a complex machine.
- Phase 1 and Phase 2 functionality is completely unaffected.
