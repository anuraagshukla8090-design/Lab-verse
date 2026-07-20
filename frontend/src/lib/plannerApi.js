/**
 * plannerApi.js — Project Planner API client
 *
 * Calls POST /plan and returns the structured plan object.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Generate a project plan grounded in lab machines.
 *
 * @param {string}   project  - User's project description
 * @param {string[]} lab_ids  - Which labs to include (default: both)
 * @returns {Promise<{ plan: object, machine_meta: object }>}
 */
export async function generatePlan(project, lab_ids = ["main_lab", "mechanical_lab"]) {
  const res = await fetch(`${API_BASE}/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project, lab_ids }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Server error ${res.status}`);
  }

  return res.json();
}
