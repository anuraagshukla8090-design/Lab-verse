/**
 * NavigationHotspot — Floor Beacon
 *
 * Factory function that creates a Pannellum custom hotspot DOM element
 * styled as a Matterport / Google Street View style floor marker.
 *
 * Design principles:
 *  - Flat ellipse shape (wider than tall) to read as a floor projection
 *  - Outer ring pulses to draw attention without feeling like a UI button
 *  - Inner glowing core indicates the target
 *  - Destination label appears only on hover (small pill above the beacon)
 *  - No large floating arrows, no heavy UI chrome
 *
 * The `direction` field from lab_config.json is accepted for API compatibility
 * with the keyboard nav system, but not used for visual rotation — a floor
 * beacon's position (pitch/yaw) communicates direction implicitly.
 */

/**
 * Returns a Pannellum createTooltipFunc for a navigation floor beacon.
 * @param {string} label      Destination label ("Node 02")
 * @param {string} direction  Direction hint — kept for API compat, not visualised
 * @returns {function}        Pannellum createTooltipFunc(hotSpotDiv) signature
 */
export function createNavHotspotElement(label, direction = "forward") {
  return (hotSpotDiv) => {
    // Remove Pannellum's default styling so we control the full appearance
    hotSpotDiv.classList.remove("pnlm-hotspot");

    const wrapper = document.createElement("div");
    wrapper.className = "lv-nav-hotspot";
    wrapper.setAttribute("role", "button");
    wrapper.setAttribute("aria-label", `Move to ${escapeHtml(label)}`);

    wrapper.innerHTML = `
      <div class="nav-beacon" aria-hidden="true">
        <div class="nav-beacon-pulse-ring"></div>
        <div class="nav-beacon-outer-ring"></div>
        <div class="nav-beacon-core">
          <svg width="10" height="7" viewBox="0 0 10 7" fill="none" aria-hidden="true">
            <polyline
              points="1.5,5.5 5,1.5 8.5,5.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="nav-beacon-shadow" aria-hidden="true"></div>
      </div>
      <span class="nav-beacon-label">${escapeHtml(label)}</span>
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
