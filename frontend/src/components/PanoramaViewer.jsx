import React, { useEffect, useRef, useState, useCallback } from "react";
import { FolderOpen, MapPin, Navigation2, AlertCircle } from "lucide-react";
import { createNavHotspotElement }     from "./NavigationHotspot";
import { createMachineHotspotElement } from "./MachineHotspot";
import { isPreloaded }                 from "@/lib/preloader";

/**
 * PanoramaViewer — Single-instance Pannellum with multi-scene loadScene()
 *
 * Architecture change from Phase 1:
 *
 *   Before: key={currentScene} in Home.jsx forced a full React remount on every
 *           navigation. Each navigation destroyed the WebGL context and rebuilt it
 *           from scratch (~150-230ms overhead before even touching the image).
 *
 *   After:  Viewer is created ONCE with the full scene graph pre-configured.
 *           Navigation calls viewer.loadScene() on the existing instance.
 *           WebGL context is reused — only the texture is swapped.
 *           Warm overhead drops from ~170ms to ~50ms per navigation.
 *
 * Props:
 *   labConfig      {object}  Full lab config from GET /lab-config
 *   currentScene   {string}  Key of scene to display (changes on navigation)
 *   machineNames   {object}  Map of machine_id → human-readable name
 *   onNavigate     {fn}      Called with target scene key
 *   onMachineClick {fn}      Called with machine_id
 *   devMode        {bool}    Disables auto-rotate, enables RAF coord polling
 *   onViewChange   {fn}      Called with { pitch, yaw, hfov } in dev mode
 */
export default function PanoramaViewer({
  labConfig,
  currentScene,
  machineNames,
  onNavigate,
  onMachineClick,
  devMode = false,
  onViewChange,
}) {
  const containerRef    = useRef(null);
  const viewerRef       = useRef(null);     // single Pannellum instance — never recreated on nav
  const viewerReady     = useRef(false);    // true once the viewer is live
  const currentSceneRef = useRef(currentScene); // mutable ref for use inside async callbacks

  const [sceneState, setSceneState] = useState("loading"); // loading|ready|missing|error
  const [errorMsg,   setErrorMsg]   = useState("");

  // Tracks 404'd panoramas so we skip HEAD + loadScene on repeat visits
  const missingSet = useRef(new Set());

  // Stable callback references — prevents init effect from re-firing on re-renders
  const handleNavigate     = useCallback(onNavigate,     [onNavigate]);
  const handleMachineClick = useCallback(onMachineClick, [onMachineClick]);

  // Keep currentSceneRef in sync — used by the Pannellum error handler (a closure
  // that can't hold React state without going stale)
  useEffect(() => { currentSceneRef.current = currentScene; }, [currentScene]);

  // ------------------------------------------------------------------
  // EFFECT A — Viewer Initialization
  //
  // Runs once when labConfig + machineNames are ready (and on devMode
  // toggle, which requires a new autoRotate config in the viewer default).
  //
  // Builds the complete Pannellum multi-scene config from labConfig so
  // every subsequent loadScene() call is a fast in-place texture swap.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!labConfig || !containerRef.current || !window.pannellum) return;

    // Destroy any existing viewer (only happens on devMode toggle)
    if (viewerRef.current) {
      try { viewerRef.current.destroy(); } catch (_) {}
      viewerRef.current  = null;
      viewerReady.current = false;
    }

    const apiBase     = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const firstSceneKey = currentSceneRef.current || labConfig.default_scene;
    const firstScene    = labConfig.scenes[firstSceneKey];

    if (!firstScene?.image) {
      setSceneState("missing");
      return;
    }
    if (missingSet.current.has(firstSceneKey)) {
      setSceneState("missing");
      return;
    }

    setSceneState("loading");

    const imageUrl = firstScene.image.startsWith("http")
      ? firstScene.image
      : `${apiBase}${firstScene.image}`;

    const t0 = performance.now();

    fetch(imageUrl, { method: "HEAD" })
      .then((res) => {
        if (!res.ok) {
          missingSet.current.add(firstSceneKey);
          setSceneState("missing");
          return;
        }

        const headMs = Math.round(performance.now() - t0);
        const t1     = performance.now();

        // Build complete multi-scene config — all scenes, all hotspots, upfront
        const scenes = buildScenesConfig(
          labConfig, apiBase, machineNames, handleNavigate, handleMachineClick
        );

        try {
          viewerRef.current = window.pannellum.viewer(containerRef.current, {
            default: {
              firstScene:                  firstSceneKey,
              autoLoad:                    true,
              autoRotate:                  devMode ? 0 : -1,
              autoRotateInactivityDelay:   3000,
              compass:                     false,
              showZoomCtrl:                false,
              showFullscreenCtrl:          false,
              hfov:                        100,
              minHfov:                     50,
              maxHfov:                     120,
            },
            scenes,
          });

          viewerReady.current = true;

          // Pannellum fires "error" when a scene panorama fails to load.
          // We capture the *current* scene via ref (not stale closure state).
          viewerRef.current.on("error", (err) => {
            const failedScene = currentSceneRef.current;
            console.error(`[PanoramaViewer] Error in scene '${failedScene}':`, err);
            missingSet.current.add(failedScene);
            setSceneState("missing");
          });

          const initMs = Math.round(performance.now() - t1);
          if (import.meta.env.DEV) {
            console.log(
              `[PanoramaViewer] INIT — HEAD: ${headMs}ms │ viewer.init: ${initMs}ms │ scenes: ${Object.keys(scenes).length}`
            );
          }

          setSceneState("ready");
        } catch (e) {
          console.error("[PanoramaViewer] Failed to initialize:", e);
          setErrorMsg(e.message);
          setSceneState("error");
        }
      })
      .catch(() => {
        missingSet.current.add(firstSceneKey);
        setSceneState("missing");
      });

  // machineNames, handleNavigate, handleMachineClick are stable refs and included
  // so the effect rebuilds the scene config if they ever change (e.g. hot reload).
  // devMode is included because it changes the autoRotate default in the viewer config.
  }, [labConfig, machineNames, handleNavigate, handleMachineClick, devMode]); // eslint-disable-line

  // ------------------------------------------------------------------
  // EFFECT B — Scene Switching via loadScene()
  //
  // Fires on every currentScene change AFTER the viewer is initialized.
  // Replaces the old destroy() + pannellum.viewer() pattern.
  //
  // Fast path: if the preloader has confirmed this image is in browser cache
  // (isPreloaded() === true), skip the HEAD check entirely and call
  // loadScene() immediately — total cost: ~20-40 ms.
  //
  // Slow path: image not yet preloaded — HEAD check first (~13-22 ms),
  // then loadScene() — total cost: ~35-60 ms.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!labConfig || !currentScene) return;
    if (!viewerReady.current || !viewerRef.current) return;

    const sceneData = labConfig.scenes[currentScene];
    if (!sceneData?.image) {
      setSceneState("missing");
      return;
    }

    if (missingSet.current.has(currentScene)) {
      setSceneState("missing");
      return;
    }

    const apiBase  = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const imageUrl = sceneData.image.startsWith("http")
      ? sceneData.image
      : `${apiBase}${sceneData.image}`;

    // ----------------------------------------------------------------
    // FAST PATH — preloader confirmed this image is in browser cache
    // Skip HEAD check, go straight to loadScene()
    // ----------------------------------------------------------------
    if (isPreloaded(imageUrl)) {
      const t = performance.now();
      try {
        viewerRef.current.loadScene(
          currentScene,
          sceneData.initial_pitch ?? 0,
          sceneData.initial_yaw   ?? 0,
          100,
        );
        const loadMs = Math.round(performance.now() - t);
        if (import.meta.env.DEV) {
          console.log(
            `[PanoramaViewer] SWITCH (cached) → '${currentScene}' │ loadScene: ${loadMs}ms │ HEAD: skipped`
          );
        }
        setSceneState("ready");
      } catch (e) {
        setErrorMsg(e.message);
        setSceneState("error");
      }
      return;
    }

    // ----------------------------------------------------------------
    // SLOW PATH — image not yet in cache, HEAD check required
    // ----------------------------------------------------------------
    setSceneState("loading");
    const t0 = performance.now();

    fetch(imageUrl, { method: "HEAD" })
      .then((res) => {
        if (!res.ok) {
          missingSet.current.add(currentScene);
          setSceneState("missing");
          return;
        }

        const headMs = Math.round(performance.now() - t0);
        const t1     = performance.now();

        try {
          viewerRef.current.loadScene(
            currentScene,
            sceneData.initial_pitch ?? 0,
            sceneData.initial_yaw   ?? 0,
            100,
          );

          const loadMs = Math.round(performance.now() - t1);
          if (import.meta.env.DEV) {
            console.log(
              `[PanoramaViewer] SWITCH (uncached) → '${currentScene}' │ HEAD: ${headMs}ms │ loadScene: ${loadMs}ms │ total: ${headMs + loadMs}ms`
            );
          }

          setSceneState("ready");
        } catch (e) {
          setErrorMsg(e.message);
          setSceneState("error");
        }
      })
      .catch(() => {
        missingSet.current.add(currentScene);
        setSceneState("missing");
      });

  }, [currentScene, labConfig]);

  // ------------------------------------------------------------------
  // EFFECT C — Dev mode RAF coordinate polling (unchanged from Phase 1)
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!devMode || sceneState !== "ready" || !onViewChange) return;

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
  }, [devMode, sceneState, onViewChange]);

  // ------------------------------------------------------------------
  // EFFECT D — Cleanup on full unmount (page unload / HMR)
  // ------------------------------------------------------------------
  useEffect(() => {
    return () => {
      if (viewerRef.current) {
        try { viewerRef.current.destroy(); } catch (_) {}
        viewerRef.current  = null;
        viewerReady.current = false;
      }
    };
  }, []);

  // ------------------------------------------------------------------
  // Render
  //
  // The container div is ALWAYS present in the DOM so the WebGL context
  // is never lost. When a panorama is missing, we render the EmptyState
  // as an overlay ON TOP of the (invisible) viewer div rather than
  // replacing it, so the viewer survives and loadScene() still works
  // when the user navigates to a scene with a valid panorama.
  // ------------------------------------------------------------------
  const sceneName = currentScene;
  const imagePath = labConfig?.scenes?.[currentScene]?.image;

  return (
    <div className="relative w-full h-screen bg-[#080d14]">

      {/* Pannellum mount point — always in DOM to keep WebGL context alive */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ visibility: sceneState === "error" ? "hidden" : "visible" }}
      />

      {/* Loading overlay — shown while HEAD check or init is in progress */}
      {sceneState === "loading" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#080d14]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-slate-400 text-sm">Loading panorama…</p>
          </div>
        </div>
      )}

      {/* Missing panorama overlay — shown over the live viewer so it can recover */}
      {sceneState === "missing" && (
        <div className="absolute inset-0 z-10">
          <EmptyState sceneName={sceneName} imagePath={imagePath} />
        </div>
      )}

      {/* Viewer error */}
      {sceneState === "error" && (
        <div className="absolute inset-0 z-10">
          <ErrorState message={errorMsg} />
        </div>
      )}

      {/* Dev mode indicator */}
      {devMode && sceneState === "ready" && (
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
// buildScenesConfig — pure function, called once at viewer init
//
// Converts the backend lab_config scene graph into the Pannellum
// multi-scene configuration format. All hotspot click handlers are
// closures over stable handleNavigate / handleMachineClick refs.
// ------------------------------------------------------------------
function buildScenesConfig(labConfig, apiBase, machineNames, handleNavigate, handleMachineClick) {
  const scenes = {};

  Object.entries(labConfig.scenes).forEach(([sceneKey, sceneData]) => {
    const imageUrl = sceneData.image?.startsWith("http")
      ? sceneData.image
      : `${apiBase}${sceneData.image}`;

    const hotSpots = [];

    (sceneData.navigation || []).forEach((nav) => {
      hotSpots.push({
        pitch:             nav.pitch,
        yaw:               nav.yaw,
        type:              "custom",
        cssClass:          "lv-pnlm-hotspot",
        createTooltipFunc: createNavHotspotElement(nav.label, nav.direction),
        clickHandlerFunc:  () => handleNavigate(nav.target),
      });
    });

    (sceneData.machines || []).forEach((m) => {
      const label = machineNames?.[m.machine_id] || m.machine_id;
      hotSpots.push({
        pitch:             m.pitch,
        yaw:               m.yaw,
        type:              "custom",
        cssClass:          "lv-pnlm-hotspot",
        createTooltipFunc: createMachineHotspotElement(label),
        clickHandlerFunc:  () => handleMachineClick(m.machine_id),
      });
    });

    scenes[sceneKey] = {
      type:     "equirectangular",
      panorama: imageUrl,
      pitch:    sceneData.initial_pitch ?? 0,
      yaw:      sceneData.initial_yaw   ?? 0,
      hotSpots,
    };
  });

  return scenes;
}

// ------------------------------------------------------------------
// Empty state — shown when panorama image doesn't exist yet
// ------------------------------------------------------------------
function EmptyState({ sceneName, imagePath }) {
  const filename = imagePath?.split("/").pop() || "image.jpg";

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#080d14] px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
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
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#080d14] px-6">
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
