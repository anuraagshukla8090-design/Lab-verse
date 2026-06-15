# Phase 4 — Project Planning Agent

> **Status: 🔜 Future Vision — not yet designed in detail**
> This document describes the long-term vision for Phase 4.
> Phase 4 requires Phases 1–3 to be complete.

---

## Goal

Give students an intelligent **project planning assistant**. A student describes what they want to build. The agent produces a complete lab execution plan: which machines they need, in which labs, in which order, with which skills to acquire first — all grounded in the real equipment and facilities available in LabVerse.

**Vision:**
> Student: "I want to build a motorized camera slider for timelapse photography."
>
> LabVerse Project Planner:
> "Here's your plan:
>
> **Skills to learn first:** Basic electronics, CAD design, G-code basics
>
> **Lab 1 — Fabrication Lab:**
> - Metal Lathe → turn the slider rail ends and motor mount
> - CNC Milling Machine → mill the carriage plate
>
> **Lab 2 — Electronics Lab:**
> - Oscilloscope → debug your motor control circuit
> - Soldering Station → assemble the motor driver board
>
> **Estimated sessions:** 6–8 lab visits
> **Complexity:** Intermediate
>
> Want me to break down each step in more detail?"

---

## Why This Is Valuable

Students with project ideas face a fundamental discovery problem: they don't know which machines, skills, or labs they need. This is especially true for interdisciplinary projects spanning fabrication, electronics, and software.

The Project Planner bridges **intent** (what the student wants to make) and **execution** (which machines, skills, and labs they need) — automatically and intelligently.

---

## Core Concepts

### Project Description
A free-text description of what the student wants to build. No structured input required — the agent extracts intent.

```
"Build a wind turbine blade from carbon fiber"
"Design and fabricate a custom PCB for a sensor array"
"Create a robotic arm with 3 degrees of freedom"
```

### Project → Machines Mapping
The agent maps project requirements to specific machines using:
1. LLM understanding of the project description
2. Machine knowledge graph from `machines.json` (skills, categories, tags)
3. Retrieval of relevant machines via Qdrant semantic search

### Machine Sequencing
Not all machines can be used in any order. The agent determines the correct sequence based on:
- Manufacturing dependencies (must machine the part before drilling it)
- Skill prerequisites (`skills_required` graph traversal)
- Physical lab flow (group by lab to minimize travel)

### Skills Workflow
For each machine in the plan, the agent specifies:
- Which skills the student needs before using it
- Which skills they'll gain from using it
- How to acquire prerequisite skills (point to simpler machines first)

---

## Proposed Architecture

```
Student Input: "I want to build a motorized camera slider"
        │
        ▼
POST /planner/generate
        │
        ▼
┌───────────────────────────────────────┐
│  Project Planning Agent (LangGraph)   │
│                                       │
│  Node 1: Intent Extraction            │
│    └── LLM: What domain? What parts?  │
│           What materials? What skills?│
│                                       │
│  Node 2: Machine Discovery            │
│    └── Qdrant semantic search:        │
│         "motor mount fabrication"     │
│         "electronics control board"   │
│         → ranked machine_ids          │
│                                       │
│  Node 3: Prerequisite Resolution      │
│    └── machines.json graph traversal  │
│         skills_required → ordering    │
│                                       │
│  Node 4: Plan Synthesis               │
│    └── LLM: generate structured plan  │
│         grouped by lab, ordered by    │
│         dependency                    │
│                                       │
│  Node 5: Validation                   │
│    └── Verify all machine_ids exist   │
│         Check skill chain is complete │
└───────────────────────────────────────┘
        │
        ▼
Structured Plan Response (JSON + Markdown)
```

---

## Agent Design (LangGraph)

Phase 4 is where **LangGraph** is appropriate. The planning process is genuinely multi-step with conditional branching:

```python
# Conceptual LangGraph state machine
from langgraph.graph import StateGraph

class PlannerState(TypedDict):
    project_description: str
    extracted_intent: dict
    candidate_machines: list[str]
    ordered_machines: list[str]
    skill_gaps: list[str]
    final_plan: dict

planner = StateGraph(PlannerState)
planner.add_node("extract_intent", extract_intent_node)
planner.add_node("discover_machines", discover_machines_node)
planner.add_node("resolve_prerequisites", resolve_prerequisites_node)
planner.add_node("synthesize_plan", synthesize_plan_node)
planner.add_node("validate_plan", validate_plan_node)

planner.set_entry_point("extract_intent")
planner.add_edge("extract_intent", "discover_machines")
planner.add_edge("discover_machines", "resolve_prerequisites")
planner.add_edge("resolve_prerequisites", "synthesize_plan")
planner.add_conditional_edges("validate_plan", ...)
```

---

## API Endpoint

### `POST /planner/generate`

**Request:**
```json
{
  "project_description": "Build a motorized camera slider for timelapse photography",
  "student_skills": ["basic_electronics", "cad_basics"],
  "available_labs": ["electronics_lab", "fabrication_lab"]
}
```

**Response:**
```json
{
  "plan_id": "plan_abc123",
  "project_title": "Motorized Camera Slider",
  "complexity": "intermediate",
  "estimated_sessions": 7,
  "skill_gaps": ["g_code", "motor_control"],
  "phases": [
    {
      "phase": 1,
      "title": "Learn Prerequisites",
      "machines": [
        {
          "machine_id": "lathe_01",
          "purpose": "Learn basic turning for the rail ends",
          "skills_gained": ["turning", "facing"]
        }
      ]
    },
    {
      "phase": 2,
      "title": "Fabrication Lab",
      "lab": "Fabrication Lab",
      "machines": [
        {
          "machine_id": "cnc_01",
          "purpose": "Mill the carriage plate to spec",
          "skills_gained": ["cnc_programming", "precision_machining"]
        }
      ]
    }
  ],
  "markdown_plan": "## Motorized Camera Slider Plan\n\n..."
}
```

---

## Frontend Changes (Phase 4)

### New Page: `ProjectPlannerPage.jsx`

**Route:** `/planner`

```
┌─────────────────────────────────────┐
│  LabVerse Project Planner            │
│                                     │
│  What do you want to build?         │
│  ┌─────────────────────────────┐   │
│  │ Describe your project...    │   │
│  └─────────────────────────────┘   │
│  [Generate Plan]                    │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  📋 Your Plan: Motorized Slider     │
│  Complexity: Intermediate · 7 sess  │
│                                     │
│  Phase 1 — Learn Prerequisites      │
│  ├── 🔧 Metal Lathe                 │
│  │     Turn rail ends               │
│  │     Skills: turning, facing      │
│  │                                  │
│  Phase 2 — Fabrication Lab          │
│  ├── 🖥️ CNC Milling Machine         │
│  │     Mill the carriage plate      │
│                                     │
│  [Download PDF Plan] [Start Tour]   │
└─────────────────────────────────────┘
```

### Integration with Phase 1 Virtual Tour

The "Start Tour" button in the planner launches the 360° panorama viewer and highlights only the machines in the student's plan — a guided virtual walkthrough of their specific project workflow.

---

## Future Possibilities

These are ideas beyond Phase 4 that could emerge from the planning agent:

1. **Lab Booking Integration** — Connect the generated plan to a real lab booking system so students can reserve machine time directly from their plan.

2. **Project History** — Save and revisit past plans; track which phases have been completed.

3. **Collaborative Planning** — Two students working on the same project can share and annotate a plan.

4. **Material Cost Estimation** — Extend the plan with estimated material costs and supplier links.

5. **Instructor Review Mode** — Faculty can review and annotate student plans before lab access is granted.

6. **Cross-Institution Discovery** — If a required machine isn't available in the student's lab, suggest equivalent machines at partner institutions.

---

## Phase 4 Non-Goals

- **Real-time machine availability** — no IoT integration with actual machine status
- **Automatic lab booking** — booking integration is a future Phase 5 feature
- **Cost accounting** — material and machine-time costing is out of scope
- **Multi-user projects** — single-student plans only in Phase 4 MVP

---

## Success Criteria

- A student with a project idea and no prior lab experience receives a complete, actionable plan in under 60 seconds.
- The plan references only real machines that exist in `machines.json`.
- The skill sequencing is logically correct (no machine appears before its prerequisites).
- The plan is groupable by lab to minimize unnecessary travel.
- Phase 1–3 functionality is completely unaffected.
