/**
 * LabVerse API Client — Phase 1
 *
 * All fetch calls are centralized here. The base URL is read from an
 * environment variable so the same build can point to different backends.
 *
 * Future phases add more functions here (e.g., streamChat, searchDocuments)
 * without changing any component import paths.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function apiFetch(path) {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`API ${path} failed [${response.status}]: ${detail}`);
  }
  return response.json();
}

/** Fetch the full scene graph (scenes, navigation, machine hotspots). */
export async function getLabConfig() {
  return apiFetch("/lab-config");
}

/**
 * Fetch all machines with metadata and content merged.
 * Returns a map keyed by machine_id.
 */
export async function getMachines() {
  return apiFetch("/machines");
}

/**
 * Fetch a single machine by ID with metadata and content merged.
 * Phase 2 will add RAG-retrieved document context to this response.
 */
export async function getMachine(machineId) {
  return apiFetch(`/machines/${machineId}`);
}
