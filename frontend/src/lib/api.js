/**
 * LabVerse API Client — Phase 1 + Phase 2.2
 *
 * All fetch calls are centralized here. The base URL is read from an
 * environment variable so the same build can point to different backends.
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
 */
export async function getMachine(machineId) {
  return apiFetch(`/machines/${machineId}`);
}

/**
 * Phase 2.2 — RAG chat
 *
 * Send a question about a specific machine and receive a grounded answer
 * from the knowledge base via the backend RAG pipeline.
 *
 * @param {string} machineId  Exact machine_id from machines.json
 * @param {string} question   User's natural-language question
 * @returns {{ answer, machine_id, chunks_used, sources }}
 */
export async function chatWithMachine(machineId, question) {
  const controller = new AbortController();
  // 35s frontend timeout — backend has its own 30s timeout on the LLM call
  const timer = setTimeout(() => controller.abort(), 35_000);

  try {
    const response = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ machine_id: machineId, question }),
      signal: controller.signal,
    });

    if (!response.ok) {
      let detail = "Unknown error";
      try {
        const body = await response.json();
        detail = body.detail || detail;
      } catch {
        detail = await response.text().catch(() => detail);
      }
      throw new Error(detail);
    }

    return response.json();
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out. The AI service is taking too long — please try again.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
