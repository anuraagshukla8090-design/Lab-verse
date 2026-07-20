import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import PanoramaViewer         from "@/components/PanoramaViewer";
import MachineSheet           from "@/components/MachineSheet";
import InventorySheet         from "@/components/InventorySheet";
import ProjectPlannerSheet    from "@/components/ProjectPlannerSheet";
import LoadingScreen          from "@/components/LoadingScreen";
import NavigationCompass      from "@/components/NavigationCompass";
import { getLabConfig, getMachines } from "@/lib/api";
import { preloadAdjacentScenes }     from "@/lib/preloader";
import {
  Map,
  Layers,
  AlertCircle,
  Wifi,
  Navigation2,
  MapPin,
  ChevronDown,
  Sparkles,
} from "lucide-react";

/**
 * Home — root page
 *
 * Orchestrates the full LabVerse experience:
 *  1. Fetch lab config (scene graph + hotspot positions)
 *  2. Fetch all machine data (merged metadata + content)
 *  3. Render PanoramaViewer for the current scene
 *  4. Show NavigationCompass HUD for in-scene navigation
 *  5. Open MachineSheet when a machine hotspot is clicked
 *  6. Navigate to a new scene when a nav hotspot or compass arrow is clicked
 *  7. Provide DevPanel for coordinate capture during hotspot placement
 *
 * Scene selector (dropdown) is hidden behind a small debug button.
 * Navigation is primarily driven by in-panorama arrows and the compass HUD.
 */
export default function Home() {
  const [labConfig,     setLabConfig]     = useState(null);
  const [machines,      setMachines]      = useState({});
  const [currentScene,  setCurrentScene]  = useState(null);
  const [activeMachine, setActiveMachine] = useState(null);
  const [sheetOpen,     setSheetOpen]     = useState(false);
  const [activeRack,         setActiveRack]         = useState(null);
  const [inventorySheetOpen, setInventorySheetOpen] = useState(false);
  const [plannerOpen,        setPlannerOpen]        = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [debugMenuOpen, setDebugMenuOpen] = useState(false);  // scene-jump dropdown
  const [overlayState,  setOverlayState]  = useState("idle"); // idle | closing | opening

  // Ref mirrors overlayState so handleNavigate can read it without becoming stale.
  // Using a ref avoids adding overlayState to useCallback deps, keeping the callback
  // identity stable for the keyboard useEffect dependency array.
  const overlayRef = useRef("idle");

  // ------------------------------------------------------------------
  // Bootstrap — fetch config and all machine data on mount
  // ------------------------------------------------------------------
  useEffect(() => {
    async function bootstrap() {
      try {
        const [config, machineData] = await Promise.all([
          getLabConfig(),
          getMachines(),
        ]);
        setLabConfig(config);
        setMachines(machineData);
        setCurrentScene(config.default_scene);
      } catch (err) {
        console.error("[LabVerse] Bootstrap failed:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------

  const handleNavigate = useCallback((targetScene) => {
    // Guard: ignore if a transition is already in progress.
    if (overlayRef.current !== "idle") return;

    setSheetOpen(false);
    setActiveMachine(null);
    setDebugMenuOpen(false);

    // Phase 1 — fade to dark (0 → 1) over 220 ms
    overlayRef.current = "closing";
    setOverlayState("closing");

    // Phase 2 — switch scene, then fade from dark (1 → 0) over 480 ms
    setTimeout(() => {
      setCurrentScene(targetScene);
      overlayRef.current = "opening";
      setOverlayState("opening");
    }, 230);

    // Phase 3 — clear overlay once opening animation completes
    setTimeout(() => {
      overlayRef.current = "idle";
      setOverlayState("idle");
    }, 230 + 490);
  }, []);

  const handleMachineClick = useCallback((machineId) => {
    setActiveMachine(machines[machineId] ?? { machine_id: machineId, name: machineId });
    setSheetOpen(true);
  }, [machines]);

  const handleSheetClose = useCallback(() => {
    setSheetOpen(false);
    setTimeout(() => setActiveMachine(null), 300);
  }, []);

  const handleInventoryClick = useCallback((rack) => {
    setActiveRack(rack);
    setInventorySheetOpen(true);
  }, []);

  const handleInventorySheetClose = useCallback(() => {
    setInventorySheetOpen(false);
    setTimeout(() => setActiveRack(null), 300);
  }, []);

  // ------------------------------------------------------------------
  // Adjacent-scene preloading
  //
  // Fires on mount (default scene) and on every scene change.
  // Delegates entirely to preloader.js which handles:
  //   - Deduplication   (module-level Set — survives re-renders)
  //   - GC safety       (module-level Map keeps Image refs alive)
  //   - Missing files   (onerror evicts URL so retry is possible)
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!labConfig || !currentScene) return;
    preloadAdjacentScenes(currentScene, labConfig);
  }, [labConfig, currentScene]);


  // ------------------------------------------------------------------
  // Render — loading
  // ------------------------------------------------------------------
  // useMemo must be declared before any early returns (Rules of Hooks).
  // It keeps machineNames reference stable across renders so PanoramaViewer's
  // useEffect dep array doesn't change on every setViewCoords() call (60 fps
  // in dev mode), which would destroy + reinitialize Pannellum each frame.
  const machineNames = useMemo(
    () => Object.fromEntries(Object.entries(machines).map(([id, m]) => [id, m.name || id])),
    [machines]
  );

  if (loading) return <LoadingScreen />;

  // ------------------------------------------------------------------
  // Render — error
  // ------------------------------------------------------------------
  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#080d14] px-6 gap-6">
        <div className="h-16 w-16 rounded-2xl bg-red-900/20 border border-red-500/30 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-white mb-2">Cannot Connect to Backend</h2>
          <p className="text-slate-400 text-sm mb-4">
            LabVerse could not reach the FastAPI server. Ensure the backend is running.
          </p>
          <code className="block rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-xs font-mono text-red-300 text-left">
            cd labverse/backend{"\n"}uvicorn main:app --reload
          </code>
          <p className="mt-4 text-xs text-slate-600">Error: {error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!labConfig || !currentScene) return null;

  const scene      = labConfig.scenes[currentScene];
  const sceneList  = Object.keys(labConfig.scenes);
  const sceneLabel = scene?.label || currentScene.replace(/_/g, " ");


  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#080d14]">

      {/* ---- Scene Transition Overlay ----
           Two-phase smooth fade driven by overlayState:
             "closing" → transparent-to-dark (220 ms) before scene switch
             "opening" → dark-to-transparent (480 ms) after scene switch
           Home.jsx coordinates timing; CSS handles the animation. */}
      {overlayState !== "idle" && (
        <div
          className={`lv-scene-overlay lv-scene-overlay--${overlayState}`}
          aria-hidden="true"
        />
      )}

      {/* ---- 360° Panorama Viewer ---- */}
      <PanoramaViewer
        labConfig={labConfig}
        currentScene={currentScene}
        machineNames={machineNames}
        onNavigate={handleNavigate}
        onMachineClick={handleMachineClick}
        onInventoryClick={handleInventoryClick}
      />

      {/* ---- Top Bar ---- */}
      <header className="pointer-events-none absolute top-0 left-0 right-0 z-20 flex items-start justify-between px-5 pt-5">
        {/* Wordmark + lab name */}
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-900/40 shrink-0">
            <svg viewBox="0 0 40 40" fill="none" className="h-5 w-5" aria-hidden="true">
              <circle cx="20" cy="20" r="3" fill="white" />
              <ellipse cx="20" cy="20" rx="14" ry="6" stroke="white" strokeWidth="1.5" fill="none" strokeOpacity="0.8" />
              <ellipse cx="20" cy="20" rx="14" ry="6" stroke="white" strokeWidth="1.5" fill="none" strokeOpacity="0.8" transform="rotate(60 20 20)" />
              <ellipse cx="20" cy="20" rx="14" ry="6" stroke="white" strokeWidth="1.5" fill="none" strokeOpacity="0.8" transform="rotate(-60 20 20)" />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold text-white drop-shadow-lg leading-none">
              Lab<span className="text-blue-400">Verse</span>
            </p>
            {labConfig.lab_name && (
              <p className="text-[10px] text-slate-500 mt-0.5 leading-none">{labConfig.lab_name}</p>
            )}
          </div>
        </div>

        {/* Scene breadcrumb pill */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-4 py-2 backdrop-blur-md text-xs font-medium text-slate-300">
            <Map className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <span className="capitalize">{sceneLabel}</span>
          </div>
        </div>
      </header>

      {/* ---- Navigation Compass HUD — bottom center ----
           Hoisted above the bottom bar. Pointer-events managed per child. */}
      <div className="pointer-events-none absolute bottom-20 left-0 right-0 z-20 flex justify-center px-4">
        <div className="pointer-events-auto">
          <NavigationCompass
            scene={scene}
            sceneName={currentScene}
            labConfig={labConfig}
            onNavigate={handleNavigate}
          />
        </div>
      </div>


      {/* ---- Bottom Control Bar ---- */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 flex items-end justify-between px-5 pb-5">

        {/* Left side: Plan button + Scene jump dropdown */}
        <div className="pointer-events-auto flex items-center gap-2">

          {/* Plan a Project button */}
          <button
            id="plan-project-btn"
            onClick={() => setPlannerOpen(true)}
            title="Plan a project using lab machines"
            className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-950/70 px-3 py-2 backdrop-blur-md text-xs font-semibold text-purple-300 hover:border-purple-400/60 hover:text-purple-200 hover:bg-purple-900/80 transition-all shadow-lg shadow-purple-900/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Plan a Project</span>
          </button>

          <div className="relative">
            <button
              id="scene-selector-btn"
              onClick={() => setDebugMenuOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={debugMenuOpen}
              title="Jump to scene (debug)"
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-black/60 px-3 py-2 backdrop-blur-md text-xs font-semibold text-slate-400 hover:text-slate-200 hover:border-white/25 transition-all"
            >
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Scenes</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-200 ${debugMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {debugMenuOpen && (
              <div
                className="absolute bottom-full mb-2 left-0 min-w-[210px] rounded-xl border border-white/15 bg-[#0d1117]/96 backdrop-blur-md shadow-2xl overflow-hidden animate-fade-in"
                role="listbox"
                aria-label="Jump to scene"
              >
                <div className="px-4 py-2 border-b border-white/8">
                  <p className="text-[9px] font-bold tracking-widest uppercase text-slate-600">
                    Debug — Scene Jump
                  </p>
                </div>
                {sceneList.map((key) => {
                  const s = labConfig.scenes[key];
                  const label = s?.label || key.replace(/_/g, " ");
                  return (
                    <button
                      key={key}
                      id={`scene-${key}`}
                      role="option"
                      aria-selected={key === currentScene}
                      onClick={() => handleNavigate(key)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-xs transition-colors text-left ${
                        key === currentScene
                          ? "bg-blue-600/20 text-blue-300"
                          : "text-slate-300 hover:bg-white/8 hover:text-white"
                      }`}
                    >
                      <Map className="h-3 w-3 shrink-0 opacity-50" />
                      <span className="flex-1">{label}</span>
                      {key === currentScene && (
                        <span className="text-blue-400 text-[10px]">●</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right side: Legend */}
        <div className="pointer-events-none flex items-center gap-3 rounded-xl border border-white/10 bg-black/50 px-3 py-2 backdrop-blur-md text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Navigation2 className="h-3 w-3 text-blue-400" />
            <span>Navigate</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-cyan-400" />
            <span>Machine</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            <Wifi className="h-2.5 w-2.5 text-emerald-400" />
            <span>{Object.keys(machines).length}</span>
          </div>
        </div>
      </div>

      {/* ---- Machine Sheet ---- */}
      <MachineSheet
        machine={activeMachine}
        open={sheetOpen}
        onClose={handleSheetClose}
      />

      {/* ---- Inventory Sheet ---- */}
      {inventorySheetOpen && activeRack && (
        <InventorySheet
          rack={activeRack}
          labId={labConfig?.lab_id || "main_lab"}
          onClose={handleInventorySheetClose}
        />
      )}

      {/* ---- Project Planner Sheet ---- */}
      {plannerOpen && (
        <ProjectPlannerSheet
          onClose={() => setPlannerOpen(false)}
          onMachineClick={(machineId) => {
            setPlannerOpen(false);
            const machine = machines[machineId];
            if (machine) {
              setActiveMachine({ ...machine, machine_id: machineId });
              setSheetOpen(true);
            }
          }}
        />
      )}

      {/* Click overlay to close debug menu */}
      {debugMenuOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setDebugMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
