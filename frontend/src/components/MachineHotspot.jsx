/**
 * MachineHotspot
 *
 * Factory function that creates a DOM element for a Pannellum machine hotspot.
 * Used by PanoramaViewer via the Pannellum `createTooltipFunc` API.
 *
 * Pannellum hotspots are created imperatively against the DOM (not as React
 * components) because Pannellum manages its own rendering lifecycle outside
 * of React. This module encapsulates all machine hotspot markup and behaviour
 * so PanoramaViewer stays clean.
 *
 * Usage (inside PanoramaViewer):
 *   import { createMachineHotspotElement } from './MachineHotspot';
 *   createTooltipFunc: createMachineHotspotElement(machineName)
 */

/**
 * Returns a Pannellum createTooltipFunc for a machine info hotspot.
 * @param {string} label  Machine name shown under the marker
 * @returns {function}    Function that receives the hotspot container div
 */
export function createMachineHotspotElement(label) {
  return (hotSpotDiv) => {
    // Remove default Pannellum styling
    hotSpotDiv.classList.remove("pnlm-hotspot");

    const wrapper = document.createElement("div");
    wrapper.className = "lv-machine-hotspot";
    wrapper.setAttribute("role", "button");
    wrapper.setAttribute("aria-label", `View ${label} information`);
    wrapper.innerHTML = `
      <div class="machine-marker" aria-hidden="true">
        <svg
          width="16" height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83
                   M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
        </svg>
      </div>
      <span class="machine-label">${escapeHtml(label)}</span>
    `;

    hotSpotDiv.appendChild(wrapper);
  };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
