"""
LabVerse — Inventory Router  (backend/routers/inventory.py)

Provides CRUD endpoints for per-lab inventory management.
Inventory is stored in JSON files (no database required).

Supported lab_ids:
  - main_lab        → data/inventory_main_lab.json
  - mechanical_lab  → data/inventory_mechanical_lab.json

No RAG / vector search — pure JSON CRUD only.
"""

import json
import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/inventory", tags=["inventory"])

# ── Storage helpers ───────────────────────────────────────────────────────────

DATA_DIR = Path(__file__).parent.parent / "data"

LAB_FILES = {
    "main_lab": DATA_DIR / "inventory_main_lab.json",
    "mechanical_lab": DATA_DIR / "inventory_mechanical_lab.json",
}


def _load(lab_id: str) -> dict:
    path = LAB_FILES.get(lab_id)
    if path is None:
        raise HTTPException(status_code=404, detail=f"Unknown lab_id '{lab_id}'. Valid: {list(LAB_FILES)}")
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Inventory file not found for '{lab_id}'")
    return json.loads(path.read_text(encoding="utf-8"))


def _save(lab_id: str, data: dict) -> None:
    path = LAB_FILES[lab_id]
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def _find_rack(data: dict, rack_id: str) -> Optional[dict]:
    for rack in data.get("racks", []):
        if rack["rack_id"] == rack_id:
            return rack
    return None


def _find_item(rack: dict, item_id: str) -> Optional[dict]:
    for item in rack.get("items", []):
        if item["id"] == item_id:
            return item
    return None


# ── Pydantic models ───────────────────────────────────────────────────────────

class RackCreate(BaseModel):
    rack_id: Optional[str] = None          # auto-generated if omitted
    name: str
    node: str = ""
    pitch: float = -10.0
    yaw: float = 0.0


class ItemCreate(BaseModel):
    name: str
    category: str = "General"
    quantity: int = 0
    unit: str = "units"
    in_stock: bool = True


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = None
    unit: Optional[str] = None
    in_stock: Optional[bool] = None


class RackUpdate(BaseModel):
    name: Optional[str] = None
    node: Optional[str] = None
    pitch: Optional[float] = None
    yaw: Optional[float] = None


# ── Read endpoints ─────────────────────────────────────────────────────────────

@router.get("/{lab_id}")
def get_inventory(lab_id: str):
    """Return all racks and items for the given lab."""
    return _load(lab_id)


@router.get("/{lab_id}/racks/{rack_id}")
def get_rack(lab_id: str, rack_id: str):
    """Return a single rack and its items."""
    data = _load(lab_id)
    rack = _find_rack(data, rack_id)
    if rack is None:
        raise HTTPException(status_code=404, detail=f"Rack '{rack_id}' not found in '{lab_id}'")
    return rack


# ── Rack CRUD ──────────────────────────────────────────────────────────────────

@router.post("/{lab_id}/racks", status_code=201)
def create_rack(lab_id: str, body: RackCreate):
    """Add a new rack to the lab inventory."""
    data = _load(lab_id)
    rack_id = body.rack_id or f"rack_{uuid.uuid4().hex[:8]}"
    if _find_rack(data, rack_id):
        raise HTTPException(status_code=409, detail=f"Rack '{rack_id}' already exists")
    new_rack = {
        "rack_id": rack_id,
        "name": body.name,
        "node": body.node,
        "pitch": body.pitch,
        "yaw": body.yaw,
        "items": [],
    }
    data["racks"].append(new_rack)
    _save(lab_id, data)
    return new_rack


@router.put("/{lab_id}/racks/{rack_id}")
def update_rack(lab_id: str, rack_id: str, body: RackUpdate):
    """Update rack metadata (name, node, pitch, yaw)."""
    data = _load(lab_id)
    rack = _find_rack(data, rack_id)
    if rack is None:
        raise HTTPException(status_code=404, detail=f"Rack '{rack_id}' not found")
    if body.name is not None:
        rack["name"] = body.name
    if body.node is not None:
        rack["node"] = body.node
    if body.pitch is not None:
        rack["pitch"] = body.pitch
    if body.yaw is not None:
        rack["yaw"] = body.yaw
    _save(lab_id, data)
    return rack


@router.delete("/{lab_id}/racks/{rack_id}", status_code=204)
def delete_rack(lab_id: str, rack_id: str):
    """Remove a rack and all its items."""
    data = _load(lab_id)
    before = len(data["racks"])
    data["racks"] = [r for r in data["racks"] if r["rack_id"] != rack_id]
    if len(data["racks"]) == before:
        raise HTTPException(status_code=404, detail=f"Rack '{rack_id}' not found")
    _save(lab_id, data)


# ── Item CRUD ──────────────────────────────────────────────────────────────────

@router.post("/{lab_id}/racks/{rack_id}/items", status_code=201)
def create_item(lab_id: str, rack_id: str, body: ItemCreate):
    """Add an item to a rack."""
    data = _load(lab_id)
    rack = _find_rack(data, rack_id)
    if rack is None:
        raise HTTPException(status_code=404, detail=f"Rack '{rack_id}' not found")
    new_item = {
        "id": f"item_{uuid.uuid4().hex[:8]}",
        "name": body.name,
        "category": body.category,
        "quantity": body.quantity,
        "unit": body.unit,
        "in_stock": body.in_stock,
    }
    rack["items"].append(new_item)
    _save(lab_id, data)
    return new_item


@router.put("/{lab_id}/racks/{rack_id}/items/{item_id}")
def update_item(lab_id: str, rack_id: str, item_id: str, body: ItemUpdate):
    """Update item fields (partial update — only provided fields are changed)."""
    data = _load(lab_id)
    rack = _find_rack(data, rack_id)
    if rack is None:
        raise HTTPException(status_code=404, detail=f"Rack '{rack_id}' not found")
    item = _find_item(rack, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail=f"Item '{item_id}' not found")
    if body.name is not None:
        item["name"] = body.name
    if body.category is not None:
        item["category"] = body.category
    if body.quantity is not None:
        item["quantity"] = body.quantity
    if body.unit is not None:
        item["unit"] = body.unit
    if body.in_stock is not None:
        item["in_stock"] = body.in_stock
    _save(lab_id, data)
    return item


@router.delete("/{lab_id}/racks/{rack_id}/items/{item_id}", status_code=204)
def delete_item(lab_id: str, rack_id: str, item_id: str):
    """Remove an item from a rack."""
    data = _load(lab_id)
    rack = _find_rack(data, rack_id)
    if rack is None:
        raise HTTPException(status_code=404, detail=f"Rack '{rack_id}' not found")
    before = len(rack["items"])
    rack["items"] = [i for i in rack["items"] if i["id"] != item_id]
    if len(rack["items"]) == before:
        raise HTTPException(status_code=404, detail=f"Item '{item_id}' not found")
    _save(lab_id, data)
