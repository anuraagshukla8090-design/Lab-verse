# LabVerse — Data Schemas

> Complete reference for all JSON data files in `backend/data/`.
> **`machine_id` is the universal key** connecting all three files and all future data stores.

---

## Overview

The data layer consists of three JSON files. They are intentionally separated by concern:

| File | Responsibility | Keyed By |
|---|---|---|
| `lab_config.json` | Where machines are placed in the physical lab (scene graph) | `scene_id` → `machine_id` |
| `machines.json` | What a machine *is* — metadata, skills, relationships | `machine_id` |
| `machine_content.json` | How a machine is *displayed* — descriptions, specs, SOPs | `machine_id` |

These three files are **merged at the API layer** by `merge_machine()` in `main.py`. The frontend always receives a single unified object per machine.

---

## `machine_id` — The Universal Key

`machine_id` is the string key that ties everything together:

```
lab_config.json     machines.json     machine_content.json
    │                    │                   │
    └────────────────────┴───────────────────┘
              machine_id = "oscilloscope_01"
```

### Naming Convention

```
{equipment_type}_{zero_padded_number}

Examples:
  oscilloscope_01
  cnc_01
  lathe_01
  function_generator_01
  3d_printer_02
```

**Rules:**
- All lowercase
- Words separated by underscores
- Numeric suffix always padded to 2 digits
- Must be consistent across all three JSON files and all static asset folders
- Static asset paths use `machine_id` as their folder name: `static/docs/{machine_id}/`, `static/machines/{machine_id}/`

---

## Schema: `lab_config.json`

**Purpose:** Defines the scene graph — which 360° scenes exist, how to navigate between them, and where machine hotspots appear in each scene.

### Top-Level Structure

```json
{
  "default_scene": "entrance",
  "scenes": {
    "<scene_id>": { ... }
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `default_scene` | `string` | ✅ | The `scene_id` to load when the app first starts |
| `scenes` | `object` | ✅ | Map of all scenes, keyed by `scene_id` |

### `scene_id`

A lowercase, underscore-separated string uniquely identifying a physical lab location.

**Examples:** `entrance`, `main_floor`, `electronics_corner`

### Scene Object

```json
{
  "image": "/static/panoramas/entrance.jpg",
  "initial_yaw": 0,
  "initial_pitch": 0,
  "navigation": [ ... ],
  "machines": [ ... ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `image` | `string` | ✅ | URL path to the equirectangular 360° panorama image, served from `/static/` |
| `initial_yaw` | `number` | ✅ | Starting horizontal look angle in degrees (0 = front, 90 = right, -90 = left) |
| `initial_pitch` | `number` | ✅ | Starting vertical look angle in degrees (0 = horizon, positive = up, negative = down) |
| `navigation` | `array` | ✅ | List of navigation hotspot objects (can be empty `[]`) |
| `machines` | `array` | ✅ | List of machine hotspot objects for this scene (can be empty `[]`) |

### Navigation Hotspot Object

```json
{
  "target": "main_floor",
  "pitch": 0,
  "yaw": 90,
  "label": "Enter Lab"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `target` | `string` | ✅ | `scene_id` of the destination scene |
| `pitch` | `number` | ✅ | Vertical angle in the panorama where the hotspot appears |
| `yaw` | `number` | ✅ | Horizontal angle in the panorama where the hotspot appears |
| `label` | `string` | ✅ | Human-readable label shown on the navigation hotspot |

### Machine Hotspot Object

```json
{
  "machine_id": "oscilloscope_01",
  "pitch": -10,
  "yaw": -90
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `machine_id` | `string` | ✅ | Must match a key in `machines.json` and `machine_content.json` |
| `pitch` | `number` | ✅ | Vertical angle in the panorama where the machine hotspot appears |
| `yaw` | `number` | ✅ | Horizontal angle in the panorama where the machine hotspot appears |

> **Note:** The same `machine_id` can appear in multiple scenes (e.g., `oscilloscope_01` appears in both `entrance` and `electronics_corner`).

### Full Example

```json
{
  "default_scene": "entrance",
  "scenes": {
    "entrance": {
      "image": "/static/panoramas/entrance.jpg",
      "initial_yaw": 0,
      "initial_pitch": 0,
      "navigation": [
        {
          "target": "main_floor",
          "pitch": 0,
          "yaw": 90,
          "label": "Enter Lab"
        }
      ],
      "machines": [
        {
          "machine_id": "oscilloscope_01",
          "pitch": -10,
          "yaw": -90
        }
      ]
    }
  }
}
```

---

## Schema: `machines.json`

**Purpose:** Machine metadata — what a machine is, what skills it requires and teaches, how complex it is, and which other machines are related.

### Top-Level Structure

```json
{
  "<machine_id>": { ... }
}
```

### Machine Metadata Object

```json
{
  "name": "Digital Oscilloscope",
  "lab": "Electronics Lab",
  "category": "Measurement & Test",
  "skills_required": ["basic_electronics"],
  "skills_taught": ["waveform_analysis", "signal_measurement"],
  "related_machines": ["function_generator_01", "multimeter_01"],
  "complexity_level": "beginner",
  "supervision_required": false,
  "tags": ["electronics", "measurement", "signal"]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | ✅ | Human-readable display name of the machine |
| `lab` | `string` | ✅ | The physical lab this machine belongs to |
| `category` | `string` | ✅ | Equipment category (e.g., "Measurement & Test", "Subtractive Manufacturing") |
| `skills_required` | `array[string]` | ✅ | Skills a student must have before using this machine safely |
| `skills_taught` | `array[string]` | ✅ | Skills a student can develop by using this machine |
| `related_machines` | `array[machine_id]` | ✅ | `machine_id`s of machines commonly used alongside this one (used for Phase 3 recommendations) |
| `complexity_level` | `string` | ✅ | One of: `beginner`, `intermediate`, `advanced` |
| `supervision_required` | `boolean` | ✅ | Whether a supervisor must be present for this machine |
| `tags` | `array[string]` | ✅ | Free-text search tags for discoverability |

### `complexity_level` Values

| Value | Meaning |
|---|---|
| `beginner` | Minimal prerequisites, safe without supervision |
| `intermediate` | Requires prior skill, supervisor sign-off needed |
| `advanced` | High risk, requires formal training |

### Full Example

```json
{
  "oscilloscope_01": {
    "name": "Digital Oscilloscope",
    "lab": "Electronics Lab",
    "category": "Measurement & Test",
    "skills_required": ["basic_electronics"],
    "skills_taught": [
      "waveform_analysis",
      "signal_measurement",
      "frequency_analysis",
      "trigger_setup"
    ],
    "related_machines": ["function_generator_01", "multimeter_01", "spectrum_analyzer_01"],
    "complexity_level": "beginner",
    "supervision_required": false,
    "tags": ["electronics", "measurement", "signal", "waveform"]
  }
}
```

---

## Schema: `machine_content.json`

**Purpose:** Rich display content for the machine info sheet — everything shown to a student when they click on a machine hotspot.

### Top-Level Structure

```json
{
  "<machine_id>": { ... }
}
```

### Machine Content Object

```json
{
  "description": "...",
  "specs": { "Bandwidth": "200 MHz", "Channels": "4" },
  "safety_summary": "...",
  "sop_summary": "...",
  "images": [],
  "manual_path": "/static/docs/oscilloscope_01/manual.pdf",
  "sop_path": "/static/docs/oscilloscope_01/sop.pdf"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `description` | `string` | ✅ | Full paragraph description of what the machine does and why it matters |
| `specs` | `object` | ✅ | Key-value pairs of technical specifications (keys and values are both strings) |
| `safety_summary` | `string` | ✅ | Plain text safety requirements and warnings |
| `sop_summary` | `string` | ✅ | Step-by-step operating procedure (numbered in text, single string) |
| `images` | `array[string]` | ✅ | List of image URL paths under `/static/machines/{machine_id}/`. Empty array `[]` until images are uploaded |
| `manual_path` | `string` | ✅ | URL path to the PDF manual under `/static/docs/{machine_id}/manual.pdf` |
| `sop_path` | `string` | ✅ | URL path to the PDF SOP under `/static/docs/{machine_id}/sop.pdf` |

### `specs` Object

Specs are a free-form key-value dictionary. Keys are human-readable spec names; values are strings (include units in the value string).

```json
"specs": {
  "Bandwidth": "200 MHz",
  "Channels": "4",
  "Sample Rate": "1 GSa/s",
  "Display": "7-inch TFT-LCD"
}
```

---

## File Relationships Diagram

```
lab_config.json
    └── scenes
            └── machines[]
                    └── machine_id ──────────────────────────────────┐
                                                                      │
machines.json                                                         │
    └── {machine_id} ◄────────────────────────────────────────────── ┘
            ├── name                                                  │
            ├── lab                                                   │
            ├── skills_required[]                                     │
            ├── skills_taught[]                                       │
            ├── related_machines[] ─► (other machine_ids)            │
            ├── complexity_level                                      │
            ├── supervision_required                                  │
            └── tags[]                                                │
                                                                      │
machine_content.json                                                  │
    └── {machine_id} ◄────────────────────────────────────────────── ┘
            ├── description
            ├── specs{}
            ├── safety_summary
            ├── sop_summary
            ├── images[]
            ├── manual_path ──► /static/docs/{machine_id}/manual.pdf
            └── sop_path    ──► /static/docs/{machine_id}/sop.pdf

Static Assets
    ├── /static/panoramas/{scene_id}.jpg
    ├── /static/docs/{machine_id}/
    │       ├── manual.pdf
    │       └── sop.pdf
    └── /static/machines/{machine_id}/
            └── {photo}.jpg
```

---

## Merged API Response

When the frontend calls `GET /machines/{machine_id}`, it receives the merged output of all three files:

```json
{
  "machine_id": "oscilloscope_01",
  "name": "Digital Oscilloscope",
  "lab": "Electronics Lab",
  "category": "Measurement & Test",
  "skills_required": ["basic_electronics"],
  "skills_taught": ["waveform_analysis", "signal_measurement"],
  "related_machines": ["function_generator_01"],
  "complexity_level": "beginner",
  "supervision_required": false,
  "tags": ["electronics", "measurement"],
  "description": "A 4-channel digital oscilloscope...",
  "specs": { "Bandwidth": "200 MHz", "Channels": "4" },
  "safety_summary": "Ensure probes are rated...",
  "sop_summary": "1. Power on the oscilloscope...",
  "images": [],
  "manual_path": "/static/docs/oscilloscope_01/manual.pdf",
  "sop_path": "/static/docs/oscilloscope_01/sop.pdf"
}
```

---

## Adding a New Machine (Checklist)

To add a new machine to LabVerse with zero code changes:

- [ ] Add the `machine_id` entry to `machines.json` with all required fields
- [ ] Add the `machine_id` entry to `machine_content.json` with all required fields
- [ ] Add the `machine_id` hotspot entry (with `pitch` and `yaw`) to the appropriate scene(s) in `lab_config.json`
- [ ] Create `backend/static/docs/{machine_id}/` folder with `manual.pdf` and `sop.pdf`
- [ ] Create `backend/static/machines/{machine_id}/` folder with machine photos
- [ ] Verify hotspot position in the panorama by running the app
