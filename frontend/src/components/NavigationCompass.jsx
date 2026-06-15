import React from "react";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Navigation2,
} from "lucide-react";

/**
 * NavigationCompass
 *
 * Floating HUD panel listing all available exits for the current scene.
 * Driven entirely by scene.navigation[] from lab_config.json — zero
 * hardcoded routes. Works for any graph topology without code changes.
 *
 * Navigation is click/tap only. No keyboard shortcuts.
 *
 * Props:
 *   scene      {object}  Current scene config ({ label, navigation[], ... })
 *   sceneName  {string}  Current scene key (e.g. "node_01")
 *   labConfig  {object}  Full lab config — used to look up target labels
 *   onNavigate {fn}      Called with targetSceneKey on click
 */

const DIR_ICONS = {
  forward: ArrowUp,
  back:    ArrowDown,
  left:    ArrowLeft,
  right:   ArrowRight,
};

export default function NavigationCompass({ scene, sceneName, labConfig, onNavigate }) {
  if (!scene?.navigation?.length) return null;

  const sceneLabel = scene.label || sceneName.replace(/_/g, " ");

  return (
    <div
      className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-black/75 px-3 py-3 backdrop-blur-xl shadow-2xl"
      style={{ minWidth: "180px" }}
      role="navigation"
      aria-label="Lab navigation"
    >
      {/* Current node indicator */}
      <div className="flex items-center gap-1.5 w-full px-1">
        <Navigation2 className="h-3 w-3 text-blue-400 shrink-0" />
        <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
          {sceneLabel}
        </span>
      </div>

      {/* Direction buttons */}
      <div className="flex flex-col gap-1 w-full">
        {scene.navigation.map((nav) => {
          const dir  = nav.direction || "forward";
          const Icon = DIR_ICONS[dir] || ArrowUp;

          const targetLabel =
            labConfig?.scenes?.[nav.target]?.label ||
            nav.label ||
            nav.target.replace(/_/g, " ");

          return (
            <button
              key={nav.target}
              id={`compass-${nav.target}`}
              onClick={() => onNavigate(nav.target)}
              aria-label={`Go to ${targetLabel}`}
              className="group flex items-center gap-2 w-full rounded-xl border px-2.5 py-2 text-left cursor-pointer transition-all duration-100 active:scale-95"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.07)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(59,130,246,0.12)";
                e.currentTarget.style.borderColor = "rgba(96,165,250,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
              }}
            >
              <div
                className="flex items-center justify-center w-4 h-4 shrink-0 transition-transform duration-100 group-hover:scale-110"
                style={{ color: dir === "forward" ? "#60a5fa" : dir === "back" ? "#94a3b8" : "#22d3ee" }}
              >
                <Icon className="w-3 h-3" />
              </div>
              <span className="flex-1 text-[11px] font-semibold text-slate-300 group-hover:text-white transition-colors truncate">
                {targetLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
