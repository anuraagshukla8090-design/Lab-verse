import React, { useState, useCallback } from "react";
import {
  Copy,
  Check,
  MapPin,
  Navigation2,
  X,
  Code2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/**
 * DevPanel — Developer coordinate tool for hotspot placement.
 *
 * Shows live pitch/yaw/hfov from the panorama viewer (updated via requestAnimationFrame
 * loop in PanoramaViewer). Lets developers copy ready-to-paste JSON snippets
 * for lab_config.json — one for navigation hotspots and one for machine hotspots.
 *
 * Also lists all currently configured hotspots for the active scene so developers
 * can see what's already placed and spot any conflicts.
 *
 * Props:
 *   coords       {{ pitch, yaw, hfov }}  Live camera coordinates from PanoramaViewer
 *   currentScene {string}               Active scene key
 *   scene        {object}               Full scene config from lab_config
 *   onClose      {fn}                   Called when user closes the panel
 */
export default function DevPanel({ coords, currentScene, scene, onClose }) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [snippetsOpen, setSnippetsOpen] = useState(true);
  const [hotspotsOpen, setHotspotsOpen] = useState(true);

  // Rounded to 1 decimal for clean JSON
  const p = coords ? Math.round(coords.pitch * 10) / 10 : 0;
  const y = coords ? Math.round(coords.yaw   * 10) / 10 : 0;

  const navSnippet = JSON.stringify(
    { target: "TARGET_SCENE_ID", pitch: p, yaw: y, label: "Label Here", direction: "forward" },
    null, 2
  );
  const machineSnippet = JSON.stringify(
    { machine_id: "MACHINE_ID", pitch: p, yaw: y },
    null, 2
  );

  const copy = useCallback(async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for environments without clipboard API
      const el = document.createElement("textarea");
      el.value = text;
      el.style.cssText = "position:fixed;top:-9999px;opacity:0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  const totalHotspots = (scene?.navigation?.length || 0) + (scene?.machines?.length || 0);

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden shadow-2xl animate-slide-in-right"
      style={{
        width: "300px",
        background: "rgba(10, 7, 3, 0.96)",
        border: "1px solid rgba(245, 158, 11, 0.3)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(245,158,11,0.08)",
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid rgba(245,158,11,0.12)", background: "rgba(245,158,11,0.04)" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Code2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-sm font-bold text-amber-300">Dev Mode</span>
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded-full truncate"
            style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24", maxWidth: "110px" }}
          >
            {currentScene}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close developer panel"
          className="flex items-center justify-center w-6 h-6 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/10 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Live Coordinates ── */}
      <div className="px-4 pt-3 pb-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="grid grid-cols-3 gap-2 mb-1.5">
          <CoordChip label="Pitch" value={coords ? `${coords.pitch.toFixed(1)}°` : "–"} color="blue" />
          <CoordChip label="Yaw"   value={coords ? `${coords.yaw.toFixed(1)}°`   : "–"} color="cyan" />
          <CoordChip label="HFOV"  value={coords ? `${coords.hfov.toFixed(0)}°`  : "–"} color="violet" />
        </div>
        <p className="text-center text-[9px] text-slate-600 font-medium">
          Drag panorama · coordinates update live
        </p>
      </div>

      {/* ── Copy Snippets ── */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <button
          className="flex items-center justify-between w-full px-4 py-2.5 text-left hover:bg-white/3 transition-colors"
          onClick={() => setSnippetsOpen((v) => !v)}
        >
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
            Copy Snippets
          </span>
          {snippetsOpen
            ? <ChevronUp className="w-3 h-3 text-slate-600" />
            : <ChevronDown className="w-3 h-3 text-slate-600" />
          }
        </button>

        {snippetsOpen && (
          <div className="px-4 pb-3 flex flex-col gap-3">
            <SnippetBlock
              icon={<Navigation2 className="w-3 h-3 text-blue-400" />}
              label="Navigation Hotspot"
              snippet={navSnippet}
              copyKey="nav"
              copiedKey={copiedKey}
              onCopy={copy}
            />
            <SnippetBlock
              icon={<MapPin className="w-3 h-3 text-cyan-400" />}
              label="Machine Hotspot"
              snippet={machineSnippet}
              copyKey="machine"
              copiedKey={copiedKey}
              onCopy={copy}
            />
          </div>
        )}
      </div>

      {/* ── Active Hotspots ── */}
      <div>
        <button
          className="flex items-center justify-between w-full px-4 py-2.5 text-left hover:bg-white/3 transition-colors"
          onClick={() => setHotspotsOpen((v) => !v)}
        >
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
            Active Hotspots
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd" }}
            >
              {totalHotspots}
            </span>
            {hotspotsOpen
              ? <ChevronUp className="w-3 h-3 text-slate-600" />
              : <ChevronDown className="w-3 h-3 text-slate-600" />
            }
          </div>
        </button>

        {hotspotsOpen && (
          <div className="px-3 pb-3 flex flex-col gap-1">
            {scene?.navigation?.map((nav, i) => (
              <HotspotRow
                key={`nav-${i}`}
                icon={<Navigation2 className="w-2.5 h-2.5 text-blue-400 shrink-0" />}
                dotColor="#3b82f6"
                id={nav.target}
                pitch={nav.pitch}
                yaw={nav.yaw}
                badge={nav.direction || "fwd"}
                badgeColor="rgba(59,130,246,0.2)"
                badgeTextColor="#93c5fd"
              />
            ))}
            {scene?.machines?.map((m, i) => (
              <HotspotRow
                key={`m-${i}`}
                icon={<MapPin className="w-2.5 h-2.5 text-cyan-400 shrink-0" />}
                dotColor="#06b6d4"
                id={m.machine_id}
                pitch={m.pitch}
                yaw={m.yaw}
              />
            ))}
            {totalHotspots === 0 && (
              <p className="text-center text-[10px] text-slate-600 py-2">
                No hotspots in this scene
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function CoordChip({ label, value, color }) {
  const palettes = {
    blue:   { border: "rgba(59,130,246,0.25)",  bg: "rgba(59,130,246,0.08)",  text: "#93c5fd" },
    cyan:   { border: "rgba(6,182,212,0.25)",   bg: "rgba(6,182,212,0.08)",   text: "#67e8f9" },
    violet: { border: "rgba(139,92,246,0.25)",  bg: "rgba(139,92,246,0.08)", text: "#c4b5fd" },
  };
  const p = palettes[color];
  return (
    <div
      className="flex flex-col items-center gap-0.5 rounded-lg py-2 px-1"
      style={{ border: `1px solid ${p.border}`, background: p.bg }}
    >
      <span className="text-[8px] font-bold tracking-widest uppercase opacity-60" style={{ color: p.text }}>
        {label}
      </span>
      <span className="text-sm font-bold font-mono" style={{ color: p.text }}>
        {value}
      </span>
    </div>
  );
}

function SnippetBlock({ icon, label, snippet, copyKey, copiedKey, onCopy }) {
  const copied = copiedKey === copyKey;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] font-semibold text-slate-400">{label}</span>
      </div>
      <pre
        className="text-[9px] font-mono rounded-lg px-2.5 py-2 leading-relaxed overflow-x-auto"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          color: "#64748b",
        }}
      >
        {snippet}
      </pre>
      <button
        onClick={() => onCopy(snippet, copyKey)}
        className="flex items-center justify-center gap-1.5 w-full rounded-lg py-1.5 text-[10px] font-bold transition-all"
        style={
          copied
            ? { background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#86efac" }
            : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }
        }
      >
        {copied
          ? <><Check className="w-3 h-3" /> Copied to clipboard!</>
          : <><Copy className="w-3 h-3" /> Copy snippet</>
        }
      </button>
    </div>
  );
}

function HotspotRow({ icon, dotColor, id, pitch, yaw, badge, badgeColor, badgeTextColor }) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
      style={{ background: "rgba(255,255,255,0.025)" }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dotColor }} />
      {icon}
      <span className="font-mono text-[10px] text-blue-300 flex-1 truncate">{id}</span>
      <span className="font-mono text-[9px] text-slate-600 shrink-0">
        p:{pitch} y:{yaw}
      </span>
      {badge && (
        <span
          className="text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0"
          style={{ background: badgeColor, color: badgeTextColor }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}
