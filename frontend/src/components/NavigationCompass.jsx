import React from "react";
import {
  ChevronUp,
  ChevronDown,
  GitFork,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

/**
 * NavigationCompass — Minimal Vertical Node-to-Node Walkthrough HUD
 */

const DIR_ICONS = {
  forward: ArrowUp,
  back:    ArrowDown,
  left:    ArrowLeft,
  right:   ArrowRight,
};

export default function NavigationCompass({ scene, sceneName, labConfig, onNavigate }) {
  if (!scene?.navigation?.length) return null;

  const navs = scene.navigation || [];

  // Identify Previous (back direction), Next (forward or primary link), and alternate branches
  const backNav = navs.find((n) => n.direction === "back");
  const forwardNav =
    navs.find((n) => n.direction === "forward") ||
    (navs.length === 1 && !backNav ? navs[0] : navs.find((n) => n !== backNav));
  const branchNavs = navs.filter((n) => n !== backNav && n !== forwardNav);

  const getLabel = (nav) => {
    if (!nav) return "";
    return labConfig?.scenes?.[nav.target]?.label || nav.label || nav.target.replace(/_/g, " ");
  };

  return (
    <div
      className="flex flex-col items-center gap-0.5 rounded-2xl border border-white/15 bg-black/80 p-1 backdrop-blur-xl shadow-2xl"
      role="navigation"
      aria-label="Node navigation"
    >
      {/* Next Node Button (Top) */}
      {forwardNav ? (
        <button
          id={`nav-next-${forwardNav.target}`}
          onClick={() => onNavigate(forwardNav.target)}
          className="group flex flex-col items-center justify-center w-full min-w-[64px] rounded-xl px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95 cursor-pointer"
          title={`Next: ${getLabel(forwardNav)}`}
          aria-label="Next node"
        >
          <ChevronUp className="h-4 w-4 text-blue-400 shrink-0 transition-transform group-hover:-translate-y-0.5" />
          <span className="text-[10px] font-medium leading-none mt-0.5">Next</span>
        </button>
      ) : (
        <div className="flex flex-col items-center justify-center w-full min-w-[64px] rounded-xl px-2 py-1 text-xs text-slate-600 opacity-40 select-none">
          <ChevronUp className="h-4 w-4 shrink-0" />
          <span className="text-[10px] leading-none mt-0.5">Next</span>
        </div>
      )}

      {/* Thin Horizontal Divider */}
      <div className="w-full h-px bg-white/15 my-0.5" />

      {/* Previous Node Button (Bottom) */}
      {backNav ? (
        <button
          id={`nav-prev-${backNav.target}`}
          onClick={() => onNavigate(backNav.target)}
          className="group flex flex-col items-center justify-center w-full min-w-[64px] rounded-xl px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95 cursor-pointer"
          title={`Previous: ${getLabel(backNav)}`}
          aria-label="Previous node"
        >
          <span className="text-[10px] font-medium leading-none mb-0.5">Prev</span>
          <ChevronDown className="h-4 w-4 text-blue-400 shrink-0 transition-transform group-hover:translate-y-0.5" />
        </button>
      ) : (
        <div className="flex flex-col items-center justify-center w-full min-w-[64px] rounded-xl px-2 py-1 text-xs text-slate-600 opacity-40 select-none">
          <span className="text-[10px] leading-none mb-0.5">Prev</span>
          <ChevronDown className="h-4 w-4 shrink-0" />
        </div>
      )}

      {/* Alternate Branch Links (if any) */}
      {branchNavs.length > 0 && (
        <>
          <div className="w-full h-px bg-white/15 my-0.5" />
          <div className="flex flex-col items-center gap-1 w-full pt-0.5">
            {branchNavs.map((nav) => (
              <button
                key={nav.target}
                id={`branch-${nav.target}`}
                onClick={() => onNavigate(nav.target)}
                className="flex items-center justify-center gap-1 w-full px-1.5 py-0.5 rounded-lg bg-cyan-950/50 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-900/60 hover:text-white text-[9px] font-medium transition-all active:scale-95 cursor-pointer"
                title={`Branch to ${getLabel(nav)}`}
              >
                <GitFork className="h-2.5 w-2.5 text-cyan-400 shrink-0" />
                <span className="max-w-[60px] truncate">{getLabel(nav)}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
