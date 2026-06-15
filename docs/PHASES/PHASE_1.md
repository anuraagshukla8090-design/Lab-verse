# Phase 1 — Immersive Lab Explorer

> **Status: ✅ Complete (pending asset uploads)**
> This document describes what Phase 1 built, how it works, and what remains to finalize.

---

## What Phase 1 Is

Phase 1 is the foundational LabVerse experience: an immersive 360° virtual tour of an engineering lab where students can navigate between locations, click on machines, and read rich machine information — all without any AI.

Phase 1 is a complete, standalone, usable product. It does not require Phase 2 to be valuable.

---

## Implemented Features

### 1. 360° Panorama Viewer
- Renders equirectangular panorama images (`.jpg` / `.JPG`) using Pannellum.
- Users can look around in full 360° using mouse drag, touch, or keyboard arrows.
- Each scene loads from a URL path served by the FastAPI static file server.

### 2. Scene Navigation
- Navigation hotspots appear as directional arrows on the panorama.
- Clicking a navigation hotspot transitions to a new scene (new panorama).
- The current scene name is displayed in the top bar pill indicator.
- A "Scenes" dropdown menu (bottom-left) allows direct jump to any scene.
- All scene definitions, navigation targets, and positions come from `lab_config.json`.

### 3. Machine Hotspots
- Machine hotspots appear as marker pins on the panorama at configured pitch/yaw angles.
- Each hotspot shows the machine name as a tooltip.
- Clicking a machine hotspot opens the Machine Info Sheet.
- All machine positions are configured in `lab_config.json` per scene.

### 4. Machine Info Sheet
- A slide-out bottom sheet (Shadcn `Sheet` component) displays rich machine data.
- Sections: Description, Technical Specs, Safety Requirements, Standard Operating Procedure.
- Machine name, lab location, complexity level, and supervision requirement are shown.
- Skill badges show `skills_required` and `skills_taught`.
- Links to PDF manual and SOP (when files are uploaded).
- All content comes from the merged API response (`machines.json` + `machine_content.json`).

### 5. Loading Screen
- A branded loading screen (`LoadingScreen.jsx`) shows while the initial API calls complete.
- Both `getLabConfig()` and `getMachines()` are fetched in parallel via `Promise.all`.

### 6. Error State
- If the backend is unreachable, a clear error screen explains how to start the server.
- Includes the exact `uvicorn` command to copy-paste.
- A "Retry" button reloads the app.

---

## Component Reference

| Component | File | Role |
|---|---|---|
| `Home` | `src/pages/Home.jsx` | Root page — state, data fetching, layout orchestration |
| `PanoramaViewer` | `src/components/PanoramaViewer.jsx` | Pannellum viewer with hotspot injection |
| `MachineHotspot` | `src/components/MachineHotspot.jsx` | Machine marker rendered on the panorama |
| `NavigationHotspot` | `src/components/NavigationHotspot.jsx` | Navigation arrow rendered on the panorama |
| `MachineSheet` | `src/components/MachineSheet.jsx` | Slide-out machine information panel |
| `LoadingScreen` | `src/components/LoadingScreen.jsx` | Branded loading state |

---

## Data Flow

```
1. App mounts → Home.jsx useEffect fires

2. Promise.all([getLabConfig(), getMachines()])
        │
        ├── GET /lab-config → { default_scene, scenes: { ... } }
        └── GET /machines   → { machine_id: { merged data } }

3. State set:
        labConfig     = full scene graph
        machines      = all machine data (keyed by machine_id)
        currentScene  = labConfig.default_scene

4. PanoramaViewer renders:
        scene.image             → Pannellum panorama
        scene.navigation[]      → NavigationHotspot per entry
        scene.machines[]        → MachineHotspot per entry
                                   (machine name looked up from machines[machine_id].name)

5. User clicks MachineHotspot:
        machines[machine_id]    → passed to MachineSheet
        sheetOpen = true        → sheet slides up

6. User clicks NavigationHotspot:
        currentScene = target   → PanoramaViewer remounts (key={currentScene})
        sheetOpen = false       → sheet closes
```

---

## Backend Panorama Workflow

To add a new scene:

1. **Photograph** the location with a 360° camera (equirectangular format).
2. **Export** as `.jpg` (recommended: 6000×3000px or higher).
3. **Place** the file in `backend/static/panoramas/` as `{scene_id}.jpg`.
4. **Add** the scene entry to `backend/data/lab_config.json`:
   ```json
   "new_scene": {
     "image": "/static/panoramas/new_scene.jpg",
     "initial_yaw": 0,
     "initial_pitch": 0,
     "navigation": [],
     "machines": []
   }
   ```
5. **Run the app** and use the Pannellum viewer to find the correct `pitch` and `yaw` values for each hotspot by looking at the target positions.
6. **Update `lab_config.json`** with the correct hotspot coordinates.

---

## Current Scenes

| Scene ID | Status | Panorama File |
|---|---|---|
| `entrance` | ✅ Image exists | `entrance.JPG` |
| `main_floor` | ⚠️ No image yet | `main_floor.jpg` (missing) |
| `electronics_corner` | ⚠️ No image yet | `electronics_corner.jpg` (missing) |

---

## Current Machines

| `machine_id` | Name | Lab | Images | PDFs |
|---|---|---|---|---|
| `oscilloscope_01` | Digital Oscilloscope | Electronics Lab | ❌ | ❌ |
| `cnc_01` | CNC Milling Machine | Fabrication Lab | ❌ | ❌ |
| `lathe_01` | Metal Lathe | Fabrication Lab | ❌ | ❌ |

---

## Folder Structure

```
labverse/
├── backend/
│   ├── main.py                         ← FastAPI app
│   ├── requirements.txt
│   ├── data/
│   │   ├── lab_config.json
│   │   ├── machines.json
│   │   └── machine_content.json
│   └── static/
│       ├── panoramas/
│       │   └── entrance.JPG
│       ├── docs/
│       │   ├── cnc_01/
│       │   ├── lathe_01/
│       │   └── oscilloscope_01/
│       └── machines/
│           ├── cnc_01/
│           ├── lathe_01/
│           └── oscilloscope_01/
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   ├── pages/
    │   │   └── Home.jsx
    │   ├── components/
    │   │   ├── PanoramaViewer.jsx
    │   │   ├── MachineHotspot.jsx
    │   │   ├── NavigationHotspot.jsx
    │   │   ├── MachineSheet.jsx
    │   │   ├── LoadingScreen.jsx
    │   │   └── ui/
    │   └── lib/
    │       ├── api.js
    │       └── utils.js
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Phase 1 → Phase 2 Transition Checklist

Before beginning Phase 2 work, ensure Phase 1 is fully complete:

- [ ] All panorama images uploaded and verified in Pannellum viewer
- [ ] All machine hotspot positions tuned in `lab_config.json`
- [ ] At least one machine has a real PDF manual in `backend/static/docs/{machine_id}/`
- [ ] At least one machine has a real PDF SOP in `backend/static/docs/{machine_id}/`
- [ ] `GET /health` returns `{"status": "ok", "version": "1.0.0", "phase": 1}`
- [ ] No console errors in the browser during normal usage
