import React, { useState, useEffect, useCallback } from "react";
import PanoramaViewer from "@/components/PanoramaViewer";
import MachineSheet   from "@/components/MachineSheet";
import LoadingScreen  from "@/components/LoadingScreen";
import { getLabConfig, getMachines } from "@/lib/api";
import {
  ChevronDown,
  Map,
  Layers,
  AlertCircle,
  Wifi,
  Navigation2,
  MapPin,
} from "lucide-react";

/**
 * Home — root page
 *
 * Orchestrates the full LabVerse Phase 1 experience:
 *  1. Fetch lab config (scenes + hotspot positions)
 *  2. Fetch all machine data (merged metadata + content)
 *  3. Render PanoramaViewer for the current scene
 *  4. Open MachineSheet when a machine hotspot is clicked
 *  5. Navigate to a new scene when a nav hotspot is clicked
 */
export default function Home() {
  const [labConfig,     setLabConfig]     = useState(null);
  const [machines,      setMachines]      = useState({});
  const [currentScene,  setCurrentScene]  = useState(null);
  const [activeMachine, setActiveMachine] = useState(null);
  const [sheetOpen,     setSheetOpen]     = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [sceneMenuOpen, setSceneMenuOpen] = useState(false);

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
    setSheetOpen(false);
    setActiveMachine(null);
    setCurrentScene(targetScene);
    setSceneMenuOpen(false);
  }, []);

  const handleMachineClick = useCallback((machineId) => {
    setActiveMachine(machines[machineId] ?? { machine_id: machineId, name: machineId });
    setSheetOpen(true);
  }, [machines]);

  const handleSheetClose = useCallback(() => {
    setSheetOpen(false);
    // Keep activeMachine data so the sheet animates out gracefully
    setTimeout(() => setActiveMachine(null), 300);
  }, []);

  // ------------------------------------------------------------------
  // Render — loading
  // ------------------------------------------------------------------
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
            cd labverse/backend{"\n"}
            uvicorn main:app --reload
          </code>
          <p className="mt-4 text-xs text-slate-600">
            Error: {error}
          </p>
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

  const scene     = labConfig.scenes[currentScene];
  const sceneList = Object.keys(labConfig.scenes);

  // Build machine name map for hotspot labels
  const machineNames = Object.fromEntries(
    Object.entries(machines).map(([id, m]) => [id, m.name || id])
  );

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#080d14]">
      {/* ---- 360° Viewer ---- */}
      <PanoramaViewer
        key={currentScene}                 // forces remount on scene change
        scene={scene}
        sceneName={currentScene}
        machineNames={machineNames}
        onNavigate={handleNavigate}
        onMachineClick={handleMachineClick}
      />

      {/* ---- Top Bar ---- */}
      <header className="pointer-events-none absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 pt-5">
        {/* Wordmark */}
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <svg viewBox="0 0 40 40" fill="none" className="h-5 w-5" aria-hidden="true">
              <circle cx="20" cy="20" r="3" fill="white" />
              <ellipse cx="20" cy="20" rx="14" ry="6" stroke="white" strokeWidth="1.5" fill="none" strokeOpacity="0.8" />
              <ellipse cx="20" cy="20" rx="14" ry="6" stroke="white" strokeWidth="1.5" fill="none" strokeOpacity="0.8" transform="rotate(60 20 20)" />
              <ellipse cx="20" cy="20" rx="14" ry="6" stroke="white" strokeWidth="1.5" fill="none" strokeOpacity="0.8" transform="rotate(-60 20 20)" />
            </svg>
          </div>
          <span className="text-base font-bold text-white drop-shadow-lg">
            Lab<span className="text-blue-400">Verse</span>
          </span>
        </div>

        {/* Scene info pill */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-4 py-2 backdrop-blur-md text-xs font-medium text-slate-300">
            <Map className="h-3.5 w-3.5 text-blue-400" />
            <span className="capitalize">{currentScene.replace(/_/g, " ")}</span>
          </div>
        </div>
      </header>

      {/* ---- Bottom Control Bar ---- */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 flex items-end justify-between px-5 pb-5">
        {/* Scene Selector */}
        <div className="pointer-events-auto relative">
          <button
            id="scene-selector-btn"
            onClick={() => setSceneMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 backdrop-blur-md text-sm font-medium text-slate-200 hover:bg-black/80 hover:border-white/25 transition-all"
            aria-haspopup="listbox"
            aria-expanded={sceneMenuOpen}
          >
            <Layers className="h-4 w-4 text-blue-400" />
            <span>Scenes</span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                sceneMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {sceneMenuOpen && (
            <div
              className="absolute bottom-full mb-2 left-0 min-w-[200px] rounded-xl border border-white/15 bg-[#0d1117]/95 backdrop-blur-md shadow-2xl overflow-hidden animate-fade-in"
              role="listbox"
              aria-label="Select scene"
            >
              {sceneList.map((key) => (
                <button
                  key={key}
                  id={`scene-${key}`}
                  role="option"
                  aria-selected={key === currentScene}
                  onClick={() => handleNavigate(key)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors text-left ${
                    key === currentScene
                      ? "bg-blue-600/20 text-blue-300"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Map className="h-3.5 w-3.5 shrink-0 opacity-60" />
                  <span className="capitalize">{key.replace(/_/g, " ")}</span>
                  {key === currentScene && (
                    <span className="ml-auto text-xs text-blue-400">Current</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="pointer-events-none flex items-center gap-4 rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 backdrop-blur-md text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Navigation2 className="h-3 w-3 text-blue-400" />
            <span>Navigate</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-cyan-400" />
            <span>Machine Info</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            <Wifi className="h-2.5 w-2.5 text-emerald-400" />
            <span>{Object.keys(machines).length} machines loaded</span>
          </div>
        </div>
      </div>

      {/* ---- Machine Sheet ---- */}
      <MachineSheet
        machine={activeMachine}
        open={sheetOpen}
        onClose={handleSheetClose}
      />

      {/* Click overlay to close scene menu */}
      {sceneMenuOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setSceneMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
