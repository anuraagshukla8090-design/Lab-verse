import React, { useEffect, useRef, useState, useCallback } from "react";
import { FolderOpen, MapPin, Navigation2, AlertCircle } from "lucide-react";
import { createNavHotspotElement }     from "./NavigationHotspot";
import { createMachineHotspotElement } from "./MachineHotspot";

/**
 * PanoramaViewer
 *
 * Wraps the Pannellum JS API imperatively using a React ref.
 * All hotspots (navigation + machine) are injected from the scene config
 * that comes from lab_config.json via the FastAPI backend.
 *
 * Props:
 *   scene          {object}  Current scene object from lab_config
 *   sceneName      {string}  Current scene key (e.g. "entrance")
 *   machineNames   {object}  Map of machine_id → machine name
 *   onNavigate     {fn}      Called with targetScene when a nav hotspot is clicked
 *   onMachineClick {fn}      Called with machine_id when a machine hotspot is clicked
 *   devMode        {bool}    When true: disables auto-rotate + starts RAF coord polling
 *   onViewChange   {fn}      Called with { pitch, yaw, hfov } when devMode is on
 */
export default function PanoramaViewer({
  scene,
  sceneName,
  machineNames,
  onNavigate,
  onMachineClick,
  devMode = false,
  onViewChange,
}) {
  const containerRef = useRef(null);
  const viewerRef    = useRef(null);

  const [panoramaState, setPanoramaState] = useState("loading"); // loading | ready | missing | error
  const [errorMsg, setErrorMsg]           = useState("");

  // Stable callbacks — prevents thrashing useEffect deps
  const handleNavigate     = useCallback(onNavigate,     [onNavigate]);
  const handleMachineClick = useCallback(onMachineClick, [onMachineClick]);

  // ------------------------------------------------------------------
  // Check whether the panorama image actually exists before initialising
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!scene?.image) {
      setPanoramaState("missing");
      return;
    }

    setPanoramaState("loading");

    const apiBase  = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const imageUrl = scene.image.startsWith("http")
      ? scene.image
      : `${apiBase}${scene.image}`;

    fetch(imageUrl, { method: "HEAD", cache: "no-cache" })
      .then((res) => setPanoramaState(res.ok ? "ready" : "missing"))
      .catch(() => setPanoramaState("missing"));
  }, [scene?.image]);

  // ------------------------------------------------------------------
  // Initialise / reinitialise Pannellum when scene or state changes
  // ------------------------------------------------------------------
  useEffect(() => {
    if (panoramaState !== "ready") return;
    if (!containerRef.current) return;
    if (!window.pannellum) {
      setErrorMsg("Pannellum library not loaded. Check your network connection.");
      setPanoramaState("error");
      return;
    }

    const apiBase  = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const imageUrl = scene.image.startsWith("http")
      ? scene.image
      : `${apiBase}${scene.image}`;

    // Destroy previous viewer if one exists
    if (viewerRef.current) {
      try { viewerRef.current.destroy(); } catch (_) { /* ignore */ }
      viewerRef.current = null;
    }

    // Build hotspot list from scene config
    const hotspots = [];

    // Navigation hotspots — pass direction so the arrow rotates correctly
    (scene.navigation || []).forEach((nav) => {
      hotspots.push({
        pitch: nav.pitch,
        yaw:   nav.yaw,
        type:  "custom",
        cssClass: "lv-pnlm-hotspot",
        createTooltipFunc: createNavHotspotElement(nav.label, nav.direction),
        clickHandlerFunc:  () => handleNavigate(nav.target),
      });
    });

    // Machine hotspots — unchanged from Phase 1
    (scene.machines || []).forEach((m) => {
      const label = machineNames?.[m.machine_id] || m.machine_id;
      hotspots.push({
        pitch: m.pitch,
        yaw:   m.yaw,
        type:  "custom",
        cssClass: "lv-pnlm-hotspot",
        createTooltipFunc: createMachineHotspotElement(label),
        clickHandlerFunc:  () => handleMachineClick(m.machine_id),
      });
    });

    try {
      viewerRef.current = window.pannellum.viewer(containerRef.current, {
        type:       "equirectangular",
        panorama:   imageUrl,
        autoLoad:   true,
        // Disable auto-rotate in dev mode so coordinates stay stable
        autoRotate: devMode ? 0 : -1,
        autoRotateInactivityDelay: 3000,
        compass:    false,
        showZoomCtrl:    false,
        showFullscreenCtrl: false,
        hotSpots:   hotspots,
        pitch: scene.initial_pitch ?? 0,
        yaw:   scene.initial_yaw   ?? 0,
        hfov:  100,
        minHfov: 50,
        maxHfov: 120,
      });

      viewerRef.current.on("error", (err) => {
        console.error("[LabVerse] Pannellum error:", err);
        setErrorMsg(String(err));
        setPanoramaState("error");
      });
    } catch (e) {
      console.error("[LabVerse] Failed to init viewer:", e);
      setErrorMsg(e.message);
      setPanoramaState("error");
    }

    return () => {
      if (viewerRef.current) {
        try { viewerRef.current.destroy(); } catch (_) { /* ignore */ }
        viewerRef.current = null;
      }
    };
  }, [panoramaState, scene, machineNames, handleNavigate, handleMachineClick, devMode]);

  // ------------------------------------------------------------------
  // Dev mode: RAF polling for live pitch / yaw / hfov
  // Starts 600ms after viewer init to ensure Pannellum is fully ready.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!devMode || panoramaState !== "ready" || !onViewChange) return;

    let rafId;
    let started = false;

    const poll = () => {
      if (viewerRef.current) {
        try {
          onViewChange({
            pitch: viewerRef.current.getPitch(),
            yaw:   viewerRef.current.getYaw(),
            hfov:  viewerRef.current.getHfov(),
          });
        } catch (_) { /* viewer not ready */ }
      }
      rafId = requestAnimationFrame(poll);
    };

    const initTimer = setTimeout(() => {
      started = true;
      rafId = requestAnimationFrame(poll);
    }, 600);

    return () => {
      clearTimeout(initTimer);
      if (started) cancelAnimationFrame(rafId);
    };
  }, [devMode, panoramaState, onViewChange]);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  if (panoramaState === "missing") {
    return <EmptyState sceneName={sceneName} imagePath={scene?.image} />;
  }

  if (panoramaState === "error") {
    return <ErrorState message={errorMsg} />;
  }

  return (
    <div className="relative w-full h-screen bg-[#080d14]">
      {/* Pannellum mount point */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Loading overlay */}
      {panoramaState === "loading" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#080d14]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-slate-400 text-sm">Loading panorama…</p>
          </div>
        </div>
      )}

      {/* Dev mode indicator banner */}
      {devMode && panoramaState === "ready" && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-sm"
            style={{
              background: "rgba(120, 53, 15, 0.9)",
              border: "1px solid rgba(245,158,11,0.5)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-amber-300">
              DEV MODE — drag to aim, copy coordinates from panel →
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Empty state — shown when panorama image doesn't exist yet
// ------------------------------------------------------------------
function EmptyState({ sceneName, imagePath }) {
  const filename = imagePath?.split("/").pop() || "image.jpg";

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#080d14] px-6">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(ellipse 50% 35% at 50% 50%, rgba(59,130,246,0.5) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-lg text-center">
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 flex items-center justify-center">
          <FolderOpen className="h-10 w-10 text-blue-400" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">No Panorama Image</h2>
          <p className="mt-2 text-slate-400">
            Scene{" "}
            <code className="rounded bg-white/10 px-2 py-0.5 text-sm font-mono text-blue-300">
              {sceneName}
            </code>{" "}
            is configured but its 360° image has not been placed yet.
          </p>
        </div>

        <div className="w-full rounded-xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-sm">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
            How to add this panorama
          </p>
          <ol className="flex flex-col gap-3">
            <Step n={1}>
              Capture a 360° equirectangular photo with your phone or a dedicated 360° camera.
            </Step>
            <Step n={2}>
              Export as <strong className="text-white">JPG</strong> and rename it:
              <code className="mt-1.5 flex rounded-lg bg-[#0d1117] border border-white/10 px-4 py-2 text-sm font-mono text-emerald-300">
                {filename}
              </code>
            </Step>
            <Step n={3}>
              Place in:
              <code className="mt-1.5 flex rounded-lg bg-[#0d1117] border border-white/10 px-4 py-2 text-sm font-mono text-emerald-300">
                backend/static/panoramas/
              </code>
            </Step>
            <Step n={4}>
              Refresh the browser — no code changes needed.
            </Step>
          </ol>
        </div>

        <div className="flex gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Navigation2 className="h-3.5 w-3.5 text-blue-400" />
            <span>Navigation hotspots</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-cyan-400" />
            <span>Machine hotspots</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#080d14] px-6">
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        <div className="h-16 w-16 rounded-2xl bg-red-900/20 border border-red-500/30 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Viewer Error</h2>
        <p className="text-slate-400 text-sm">
          The 360° viewer encountered an error loading this panorama.
        </p>
        {message && (
          <code className="rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-xs font-mono text-red-300 text-left w-full">
            {message}
          </code>
        )}
      </div>
    </div>
  );
}

function Step({ n, children }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600/20 border border-blue-500/30 text-xs font-bold text-blue-400">
        {n}
      </span>
      <span className="text-sm text-slate-400 leading-relaxed">{children}</span>
    </li>
  );
}
