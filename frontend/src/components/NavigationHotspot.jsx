/**
 * NavigationHotspot
 *
 * Factory function that creates a DOM element for a Pannellum navigation hotspot.
 * Used by PanoramaViewer via the Pannellum `createTooltipFunc` API.
 *
 * Pannellum hotspots are created imperatively against the DOM (not as React
 * components) because Pannellum manages its own rendering lifecycle outside
 * of React. This module encapsulates all navigation hotspot markup and
 * behaviour so PanoramaViewer stays clean.
 *
 * Usage (inside PanoramaViewer):
 *   import { createNavHotspotElement } from './NavigationHotspot';
 *   createTooltipFunc: createNavHotspotElement(label)
 */

/**
 * Returns a Pannellum createTooltipFunc for a navigation hotspot.
 * @param {string} label  Display label shown under the arrow
 * @returns {function}    Function that receives the hotspot container div
 */
export function createNavHotspotElement(label) {
  return (hotSpotDiv) => {
    // Remove default Pannellum styling
    hotSpotDiv.classList.remove("pnlm-hotspot");

    const wrapper = document.createElement("div");
    wrapper.className = "lv-nav-hotspot";
    wrapper.setAttribute("role", "button");
    wrapper.setAttribute("aria-label", `Navigate to ${label}`);
    wrapper.innerHTML = `
      <div class="nav-arrow" aria-hidden="true">
        <svg
          width="20" height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
      </div>
      <span class="nav-label">${escapeHtml(label)}</span>
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
