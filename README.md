# LabVerse

**Engineering Laboratory Intelligence Platform**

LabVerse is an immersive, AI-ready platform that lets students explore engineering labs in 360°, navigate between spaces, click on machines, and read full machine information — all driven by JSON configuration with zero code changes required for content updates.

> **Current phase:** Phase 1 — 360° Lab Exploration, Panorama Navigation, Machine Hotspots, Machine Information Panels.

---

## Project Overview

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS v3, shadcn/ui, Pannellum |
| Backend  | FastAPI, Uvicorn                                |
| Data     | JSON files (single source of truth)             |
| Assets   | Static panorama JPGs, machine images, PDF docs  |

### Architecture Principles

1. **JSON-driven** — scenes, hotspots, and machines are all configuration, never hardcoded
2. **API-first** — frontend never reads JSON files directly; all data flows through FastAPI
3. **Single source of truth** — `backend/data/` owns everything
4. **Future-proof** — designed for RAG, vector search, and AI without API contract changes

---

## Folder Structure

```
labverse/
├── README.md
│
├── backend/
│   ├── main.py                          # FastAPI application
│   ├── requirements.txt
│   │
│   ├── data/
│   │   ├── lab_config.json              # Scene graph, navigation, machine hotspot positions
│   │   ├── machines.json                # Machine identity and relationships
│   │   └── machine_content.json         # Machine display content (merged by API)
│   │
│   └── static/
│       ├── panoramas/                   # ← Drop 360° JPGs here
│       │   ├── entrance.jpg
│       │   ├── main_floor.jpg
│       │   └── electronics_corner.jpg
│       │
│       ├── machines/
│       │   ├── oscilloscope_01/         # Machine gallery images
│       │   ├── cnc_01/
│       │   └── lathe_01/
│       │
│       └── docs/                        # ← Phase 2 RAG documents go here
│           ├── oscilloscope_01/
│           │   ├── manual.pdf
│           │   └── sop.pdf
│           ├── cnc_01/
│           └── lathe_01/
│
└── frontend/
    ├── index.html                        # Pannellum CDN, Inter font, SEO
    ├── vite.config.js
    ├── tailwind.config.js
    │
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css                     # Design system + Pannellum hotspot styles
        │
        ├── lib/
        │   ├── api.js                    # All fetch() calls (single place to change base URL)
        │   └── utils.js                  # cn() Tailwind merge utility
        │
        ├── components/
        │   ├── ui/                       # shadcn/ui primitives
        │   │   ├── sheet.jsx
        │   │   ├── badge.jsx
        │   │   ├── button.jsx
        │   │   ├── scroll-area.jsx
        │   │   └── separator.jsx
        │   │
        │   ├── PanoramaViewer.jsx        # Pannellum wrapper, hotspot injection
        │   ├── MachineSheet.jsx          # Machine info side panel
        │   └── LoadingScreen.jsx         # Branded boot screen
        │
        └── pages/
            └── Home.jsx                  # Root orchestrator
```

---

## Installation

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm 9+

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd labverse
```

---

## Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

Interactive docs: `http://localhost:8000/docs`

### Backend API Endpoints

| Method | Path                       | Description                            |
|--------|----------------------------|----------------------------------------|
| GET    | `/lab-config`              | Full scene graph (scenes + hotspots)   |
| GET    | `/machines`                | All machines (metadata + content merged) |
| GET    | `/machines/{machine_id}`   | Single machine (metadata + content merged) |
| GET    | `/health`                  | Health check                           |
| GET    | `/static/...`              | Static file serving (images, PDFs)     |

---

## Frontend Setup

```bash
cd frontend

# Install dependencies (already done if following from scratch)
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

Create `frontend/.env.local` to override the API base URL:

```env
VITE_API_URL=http://localhost:8000
```

---

## How To Add Panorama Images

LabVerse uses **equirectangular 360° panoramas** (the standard format exported by Google Camera, iPhone, Samsung, Ricoh Theta, Insta360, etc.).

### Step 1 — Capture

Capture your 360° photo using:
- **Android**: Google Camera → Photo Sphere
- **iPhone**: Third-party app (e.g., Google Street View)
- **Dedicated cameras**: Ricoh Theta, Insta360, GoPro MAX

### Step 2 — Export

Export the panorama as a **JPG** file. Recommended resolution: **8000×4000px or higher** for good quality.

### Step 3 — Place the file

```
backend/static/panoramas/your_scene_name.jpg
```

### Step 4 — Update `lab_config.json`

Add or update the scene entry. See the next section.

### Step 5 — Restart

No code changes needed. Restart the application and the panorama loads automatically.

---

## How To Configure Scenes

Edit `backend/data/lab_config.json`.

### Full scene schema

```json
{
  "default_scene": "entrance",
  "scenes": {
    "your_scene_key": {
      "image": "/static/panoramas/your_scene_key.jpg",
      "initial_yaw": 0,
      "initial_pitch": 0,
      "navigation": [...],
      "machines": [...]
    }
  }
}
```

| Field           | Type   | Description                                              |
|-----------------|--------|----------------------------------------------------------|
| `image`         | string | Path to panorama image (relative to backend static root) |
| `initial_yaw`   | number | Starting horizontal angle in degrees (0 = forward)       |
| `initial_pitch` | number | Starting vertical angle in degrees (0 = horizon)         |
| `navigation`    | array  | Navigation hotspot list (see below)                      |
| `machines`      | array  | Machine hotspot list (see below)                         |

---

## How To Configure Navigation Hotspots

Navigation hotspots appear as glowing **blue arrows** in the panorama. Clicking them moves to another scene.

Add entries to the scene's `"navigation"` array:

```json
"navigation": [
  {
    "target": "main_floor",
    "pitch": 0,
    "yaw": 90,
    "label": "Enter Lab"
  }
]
```

| Field    | Type   | Description                                          |
|----------|--------|------------------------------------------------------|
| `target` | string | Key of the destination scene in `lab_config.json`    |
| `pitch`  | number | Vertical angle where the hotspot appears (degrees)   |
| `yaw`    | number | Horizontal angle where the hotspot appears (degrees) |
| `label`  | string | Text label shown under the arrow                     |

**Tip:** Open Pannellum's standalone viewer with your panorama to find the correct pitch/yaw values by hovering over the desired location.

---

## How To Configure Machine Hotspots

Machine hotspots appear as glowing **cyan info markers** in the panorama. Clicking them opens the machine information panel.

Add entries to the scene's `"machines"` array:

```json
"machines": [
  {
    "machine_id": "oscilloscope_01",
    "pitch": -10,
    "yaw": 45
  }
]
```

| Field        | Type   | Description                                          |
|--------------|--------|------------------------------------------------------|
| `machine_id` | string | Must match a key in `machines.json`                  |
| `pitch`      | number | Vertical angle where the hotspot appears (degrees)   |
| `yaw`        | number | Horizontal angle where the hotspot appears (degrees) |

The hotspot label is automatically pulled from `machines.json → name`.

---

## How To Add a New Machine

### 1. Add machine metadata to `backend/data/machines.json`

```json
"drill_press_01": {
  "name": "Drill Press",
  "lab": "Fabrication Lab",
  "category": "Drilling",
  "skills_required": ["basic_machining"],
  "skills_taught": ["drilling", "counterboring"],
  "related_machines": ["lathe_01"],
  "complexity_level": "beginner",
  "supervision_required": false,
  "tags": ["drilling", "fabrication"]
}
```

### 2. Add machine content to `backend/data/machine_content.json`

```json
"drill_press_01": {
  "description": "A floor-standing drill press...",
  "specs": {
    "Spindle Travel": "100 mm",
    "Chuck Capacity": "16 mm"
  },
  "safety_summary": "Clamp workpiece firmly. Do not wear gloves.",
  "sop_summary": "1. Select drill bit. 2. Set speed. 3. Clamp workpiece...",
  "images": ["/static/machines/drill_press_01/img1.jpg"],
  "manual_path": "/static/docs/drill_press_01/manual.pdf",
  "sop_path": "/static/docs/drill_press_01/sop.pdf"
}
```

### 3. Create static folders

```
backend/static/machines/drill_press_01/
backend/static/docs/drill_press_01/
```

### 4. Add the hotspot to the relevant scene in `lab_config.json`

```json
{
  "machine_id": "drill_press_01",
  "pitch": -8,
  "yaw": 200
}
```

No code changes needed.

---

## How To Add Machine Images

1. Place JPG/PNG images in:
   ```
   backend/static/machines/{machine_id}/
   ```

2. Reference them in `machine_content.json`:
   ```json
   "images": [
     "/static/machines/cnc_01/overview.jpg",
     "/static/machines/cnc_01/control_panel.jpg"
   ]
   ```

The images are served by FastAPI and displayed in the machine panel gallery.

---

## How To Add Machine Manuals and SOPs

1. Place PDF files in:
   ```
   backend/static/docs/{machine_id}/manual.pdf
   backend/static/docs/{machine_id}/sop.pdf
   ```

2. Ensure the paths are set in `machine_content.json`:
   ```json
   "manual_path": "/static/docs/cnc_01/manual.pdf",
   "sop_path": "/static/docs/cnc_01/sop.pdf"
   ```

The machine panel will display clickable download/view links automatically.

---

## How Future RAG Integration Fits Into The Architecture

The `backend/static/docs/` folder structure was pre-created specifically to support Phase 2 RAG integration. Here is how it slots in:

### Phase 2 additions (no Phase 1 changes required)

```
backend/
├── ingest.py              # NEW — reads docs/, chunks PDFs, embeds into Qdrant
├── rag/
│   ├── chunker.py         # PDF chunking logic
│   ├── embedder.py        # Embedding model wrapper
│   └── retriever.py       # Qdrant query logic
└── data/
    └── (unchanged)        # Same JSON files, same machine_ids as namespace keys
```

### API extension (backwards compatible)

The existing `GET /machines/{machine_id}` endpoint merges data from two sources today:

```python
# Phase 1
return {**metadata[id], **content[id]}

# Phase 2 — one line added, same API contract
retrieved = retriever.query(machine_id, user_query)
return {**metadata[id], **content[id], "retrieved_context": retrieved}
```

The frontend never needs to change because the API contract is preserved. The machine sheet simply renders any additional fields that appear in the response.

### machine_id as the universal key

Every PDF document lives in `docs/{machine_id}/`. The `machine_id` is the namespace that connects:
- JSON metadata → display content → Qdrant collection → graph edges → project suggestions

This ensures all four phases share a single, consistent identity key.

---

## Running Both Servers

Open two terminal windows:

**Terminal 1 — Backend**
```bash
cd labverse/backend
.venv\Scripts\activate   # Windows
uvicorn main:app --reload
```

**Terminal 2 — Frontend**
```bash
cd labverse/frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Roadmap

| Phase | Status      | Features                                                   |
|-------|-------------|------------------------------------------------------------|
| 1     | ✅ Complete | 360° exploration, panorama navigation, machine hotspots, machine info panels |
| 2     | Planned     | Machine-specific RAG, AI chat, document search             |
| 3     | Planned     | AI Lab Guide, skill recommendations, related machine discovery |
| 4     | Planned     | Project Planning Agent, machine-to-project reasoning       |
