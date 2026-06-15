# LabVerse — Lab Node Map

> Verified by lab owner on 2026-06-15. Source: hand-drawn sketch.
> Update this file whenever nodes are added, moved, or connections change.

---

## Physical Layout

Single open rectangular lab. The corridor is outside the lab connected via the main door.

```
  [ corridor_node ]  ←── panorama taken from corridor, outside the lab
         │
         │  door
         ↓
    [ node_01 ]  ←── landing node, just inside the lab door
         │
    ┌────┴──────────┐
    │               │
    ↓               ↓
[ node_02 ]    [ centre_node ]  ←── center of the lab
    ↓               │
[ node_03 ]    [ node_05 ]
    ↓               │
[ node_04 ]    [ node_06 ]
  (end)             │
               [ node_07 ]
                    │
               [ node_08 ]
                  (end)
```

---

## Node Index

| Node ID         | Image File            | Location                        |
|-----------------|-----------------------|---------------------------------|
| `corridor_node` | `corridor_node.jpg`   | Outside — corridor entry/exit   |
| `node_01`       | `node_01.jpg`         | Inside — landing at door        |
| `node_02`       | `node_02.jpg`         | Left branch — 1st position      |
| `node_03`       | `node_03.jpg`         | Left branch — 2nd position      |
| `node_04`       | `node_04.jpg`         | Left branch — end               |
| `centre_node`   | `centre_node.jpg`     | Center of lab                   |
| `node_05`       | `node_05.jpg`         | Centre branch — 1st position    |
| `node_06`       | `node_06.jpg`         | Centre branch — 2nd position    |
| `node_07`       | `node_07.jpg`         | Centre branch — 3rd position    |
| `node_08`       | `node_08.jpg`         | Centre branch — end             |

**Total: 10 nodes** (2 named + 8 numbered)

**Default entry: `node_01`** (app opens here)

---

## Connection Graph

```
corridor_node ↔ node_01

node_01 ↔ node_02       ← left branch start
node_02 ↔ node_03
node_03 ↔ node_04       ← left branch end (dead end)

node_01 ↔ centre_node   ← centre branch start
centre_node ↔ node_05
node_05 ↔ node_06
node_06 ↔ node_07
node_07 ↔ node_08       ← centre branch end (dead end)
```

---

## Walking Paths

**Left branch:**
```
corridor_node → node_01 → node_02 → node_03 → node_04
                                               (backtrack same way)
```

**Centre branch:**
```
corridor_node → node_01 → centre_node → node_05 → node_06 → node_07 → node_08
                                                              (backtrack same way)
```

Entry and exit are the same point (`corridor_node`). No loop — users explore and return.

---

## Image Placement

Place all panorama images here:

```
backend/static/panoramas/
├── corridor_node.jpg
├── node_01.jpg
├── node_02.jpg
├── node_03.jpg
├── node_04.jpg
├── centre_node.jpg
├── node_05.jpg
├── node_06.jpg
├── node_07.jpg
└── node_08.jpg
```

Format: equirectangular JPG, minimum **4096 × 2048 px** recommended.

---

## Dev Mode — Hotspot Coordinate Workflow

All `pitch` / `yaw` values in `lab_config.json` are currently `0` (placeholder).

1. Drop your panorama images into `backend/static/panoramas/`
2. Open the app — it loads at `node_01`
3. Click **Dev** button (bottom-left)
4. Navigate to the node where you want to place a floor beacon
5. Drag the panorama until the crosshair points at the floor target
6. Click **Copy Snippet** in the Dev Panel
7. Paste into that node's `navigation` entry in `lab_config.json`
8. Save — Vite hot-reloads instantly

**Recommended floor beacon pitch:** `−15` to `−25` degrees (looking slightly down).

---

## Future Connections to Consider

After testing with real panoramas, these cross-connections may feel natural:

| Connection | Reason |
|------------|--------|
| `node_02 ↔ centre_node` | If left branch and center are visually close |
| `node_04 ↔ node_08` | If the two branch ends are near each other |

Add them by editing `lab_config.json` only — no code changes needed.
