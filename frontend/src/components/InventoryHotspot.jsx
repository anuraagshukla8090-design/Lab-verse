import React from "react";

/**
 * createInventoryHotspotElement — Pannellum DOM factory (same pattern as MachineHotspot).
 * Used by PanoramaViewer via Pannellum's createTooltipFunc API.
 * @param {string} label  Rack name shown under the marker
 * @returns {function}    Receives the hotspot container div
 */
export function createInventoryHotspotElement(label) {
  return (hotSpotDiv) => {
    hotSpotDiv.classList.remove("pnlm-hotspot");

    const wrapper = document.createElement("div");
    wrapper.className = "lv-inventory-hotspot";
    wrapper.setAttribute("role", "button");
    wrapper.setAttribute("aria-label", `View inventory: ${label}`);
    wrapper.innerHTML = `
      <div class="inventory-marker" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      </div>
      <span class="inventory-label">${escapeHtml(label)}</span>
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

/**
 * InventoryHotspot — Panorama clickable hotspot for a storage rack/shelf.
 * Visually distinct from MachineHotspot: uses an amber/orange palette
 * with a box/shelf icon instead of the machine wrench icon.
 *
 * Props:
 *   rack      — { rack_id, name, node, pitch, yaw }
 *   onClick   — called with (rack) when clicked
 */
export default function InventoryHotspot({ rack, onClick }) {
  return (
    <div
      className="inventory-hotspot"
      title={`Inventory: ${rack.name}`}
      onClick={() => onClick(rack)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(rack)}
    >
      {/* Pulsing ring */}
      <div className="inventory-hotspot__ring" />

      {/* Icon button */}
      <button className="inventory-hotspot__btn" aria-label={`View inventory: ${rack.name}`}>
        {/* Box / shelf SVG icon */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      </button>

      {/* Label */}
      <span className="inventory-hotspot__label">{rack.name}</span>
    </div>
  );
}
