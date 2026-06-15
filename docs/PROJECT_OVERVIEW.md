# LabVerse — Project Overview

> An AI-powered engineering laboratory intelligence platform.

---

## What Is LabVerse?

LabVerse is a web-based platform that allows engineering students to explore physical laboratories in an immersive, interactive way — without being physically present.

Users enter a 360° virtual tour of an engineering lab, navigate between locations, click on machines and equipment to learn what they are, how they work, and how to use them safely. Over time, the platform will be extended with AI capabilities: a conversational lab guide powered by Retrieval-Augmented Generation (RAG), and an intelligent project planner that maps student goals to machines and skills.

LabVerse bridges the gap between physical lab access and digital learning. It is designed to scale from a single lab to an entire university campus worth of facilities.

---

## Problem Statement

Engineering students face several well-documented barriers to effective lab learning:

1. **Discovery problem** — Students don't know what machines exist, where they are, or what they can be used for.
2. **Intimidation barrier** — Complex equipment (CNC machines, oscilloscopes, lathes) is overwhelming to approach without prior context.
3. **Manual overload** — Technical manuals and SOPs exist but are rarely read, hard to find, and not contextually presented.
4. **Supervision bottleneck** — Students often wait for a demonstrator or instructor to show them how to use equipment.
5. **Project-to-tool gap** — When given a project brief, students don't know which machines they need or in what order.

LabVerse solves all five problems progressively across its development phases.

---

## Vision

> _"Every engineering student should be able to walk into any lab — physically or virtually — and immediately understand what every machine does, how to use it, and how it fits their current project."_

The long-term vision of LabVerse is a **lab intelligence layer** that sits on top of any physical engineering facility:

- **Explore**: Immersive 360° virtual walkthroughs of real labs.
- **Understand**: Rich, structured information about every machine and piece of equipment.
- **Learn**: AI-guided learning paths that adapt to the student's existing skills and goals.
- **Create**: A project planning assistant that takes a student's project description and generates a complete machines → skills → workflow plan.
- **Scale**: Multi-lab, multi-institution deployments managed through a simple configuration layer.

---

## Intended Users

| User Type | Primary Use Case |
|---|---|
| **Engineering students** | Explore labs, understand machines, access SOPs and manuals |
| **Lab demonstrators / technicians** | Reduce repetitive onboarding explanations |
| **Faculty / instructors** | Create guided lab introductions for new cohorts |
| **Institution administrators** | Maintain a searchable digital inventory of all lab equipment |

---

## Long-Term Goals

1. **Complete Phase 1–4 roadmap** (see `ROADMAP.md`).
2. **Support multiple labs** simultaneously through configuration, not code.
3. **Deploy on university infrastructure** with minimal ops overhead.
4. **Integrate with existing LMS** (Moodle, Canvas) via API for skills tracking.
5. **Build a machine knowledge graph** that allows recommendation of related machines, prerequisite skills, and project paths.
6. **Enable multi-modal AI interaction** — voice, text, and document-based queries.

---

## Why LabVerse Exists

Most universities have world-class lab equipment that is underutilized because students don't know it exists, don't feel confident approaching it, or can't access it outside scheduled hours. LabVerse makes lab knowledge **persistent, accessible, and intelligent** — turning static facilities into living, discoverable learning environments.

It is not an LMS, a video platform, or a simulation. It is a **lab intelligence layer** — the connective tissue between physical equipment and the digital systems students already use.

---

## Related Documents

- `CURRENT_STATUS.md` — Implementation checklist and next steps
- `ARCHITECTURE.md` — Technical system design
- `ROADMAP.md` — Phased development plan
- `AGENT_RULES.md` — Rules for all AI coding agents working on this project
