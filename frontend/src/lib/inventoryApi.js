/**
 * inventoryApi.js — Inventory API calls for LabVerse
 * Completely separate from api.js (which handles machines/RAG).
 * No chatbot / RAG features here — pure CRUD only.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Read ──────────────────────────────────────────────────────────────────────

/** Fetch all racks + items for a lab. */
export async function getInventory(labId) {
  const res = await fetch(`${BASE_URL}/inventory/${labId}`);
  if (!res.ok) throw new Error(`Failed to fetch inventory: ${res.statusText}`);
  return res.json();
}

// ── Rack CRUD ─────────────────────────────────────────────────────────────────

export async function createRack(labId, { name, node = "", pitch = -10, yaw = 0 }) {
  const res = await fetch(`${BASE_URL}/inventory/${labId}/racks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, node, pitch, yaw }),
  });
  if (!res.ok) throw new Error(`Failed to create rack: ${res.statusText}`);
  return res.json();
}

export async function deleteRack(labId, rackId) {
  const res = await fetch(`${BASE_URL}/inventory/${labId}/racks/${rackId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete rack: ${res.statusText}`);
}

// ── Item CRUD ─────────────────────────────────────────────────────────────────

export async function createItem(labId, rackId, { name, category = "General", quantity = 0, unit = "units", in_stock = true }) {
  const res = await fetch(`${BASE_URL}/inventory/${labId}/racks/${rackId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, category, quantity, unit, in_stock }),
  });
  if (!res.ok) throw new Error(`Failed to create item: ${res.statusText}`);
  return res.json();
}

export async function updateItem(labId, rackId, itemId, updates) {
  const res = await fetch(`${BASE_URL}/inventory/${labId}/racks/${rackId}/items/${itemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`Failed to update item: ${res.statusText}`);
  return res.json();
}

export async function deleteItem(labId, rackId, itemId) {
  const res = await fetch(`${BASE_URL}/inventory/${labId}/racks/${rackId}/items/${itemId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete item: ${res.statusText}`);
}
