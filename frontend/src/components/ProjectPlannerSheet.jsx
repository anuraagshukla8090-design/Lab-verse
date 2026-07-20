import React, { useState, useRef, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Clock,
  IndianRupee,
  AlertTriangle,
  Package,
  Wrench,
  CheckCircle2,
  Loader2,
  FlaskConical,
  Hammer,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import { generatePlan } from "@/lib/plannerApi";

// ── Lab toggle options ────────────────────────────────────────────────────────
const LAB_OPTIONS = [
  { id: "both",           label: "Both Labs",       ids: ["main_lab", "mechanical_lab"], icon: Zap },
  { id: "main_lab",       label: "Engineering Lab",  ids: ["main_lab"],                  icon: FlaskConical },
  { id: "mechanical_lab", label: "Mechanical Lab",   ids: ["mechanical_lab"],            icon: Hammer },
];

const DIFFICULTY_CONFIG = {
  beginner:     { label: "Beginner",     variant: "default",     className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  intermediate: { label: "Intermediate", variant: "default",     className: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  advanced:     { label: "Advanced",     variant: "destructive", className: "bg-red-500/20 text-red-300 border-red-500/30" },
};

// ── Skeleton loader ───────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return (
    <div className={`animate-pulse rounded-md bg-white/8 ${className}`} />
  );
}

function PlanSkeleton() {
  return (
    <div className="space-y-4 pt-2">
      <Skeleton className="h-7 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-3 pt-1">
        <Skeleton className="h-14 flex-1 rounded-xl" />
        <Skeleton className="h-14 flex-1 rounded-xl" />
      </div>
      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-20 w-full rounded-xl" />
      ))}
    </div>
  );
}

// ── Phase card ────────────────────────────────────────────────────────────────
function PhaseCard({ phase, machineMeta, onMachineClick }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-300 border border-purple-500/30">
          {phase.phase_number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">{phase.title}</div>
          {phase.duration && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
              <Clock size={10} /> {phase.duration}
            </div>
          )}
        </div>
        {open
          ? <ChevronUp size={14} className="text-slate-500 shrink-0" />
          : <ChevronDown size={14} className="text-slate-500 shrink-0" />}
      </button>

      {/* Body */}
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/8">
          {/* Steps */}
          <ol className="space-y-2 pt-3">
            {(phase.steps || []).map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle2 size={13} className="text-purple-400 shrink-0 mt-0.5" />
                <span>{step}</span>
              </li>
            ))}
          </ol>

          {/* Machine chips */}
          {phase.machines?.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                <Wrench size={10} /> Machines Used
              </div>
              <div className="flex flex-wrap gap-1.5">
                {phase.machines.map(mid => {
                  const meta = machineMeta?.[mid];
                  return (
                    <button
                      key={mid}
                      title={meta?.lab || mid}
                      onClick={() => onMachineClick?.(mid)}
                      className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-colors cursor-pointer"
                    >
                      {meta?.name || mid}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tip */}
          {phase.tips && (
            <div className="flex items-start gap-2 rounded-lg bg-purple-500/8 border border-purple-500/20 px-3 py-2 text-xs text-purple-300">
              <Sparkles size={11} className="shrink-0 mt-0.5" />
              <span>{phase.tips}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProjectPlannerSheet({ onClose, onMachineClick }) {
  const [selectedLab, setSelectedLab] = useState("both");
  const [projectText, setProjectText] = useState("");
  const [status, setStatus]           = useState("idle"); // idle | loading | done | error
  const [result, setResult]           = useState(null);
  const [errorMsg, setErrorMsg]       = useState("");
  const textareaRef                   = useRef(null);

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  const labIds = LAB_OPTIONS.find(o => o.id === selectedLab)?.ids ?? ["main_lab", "mechanical_lab"];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!projectText.trim() || status === "loading") return;
    setStatus("loading");
    setResult(null);
    setErrorMsg("");
    try {
      const data = await generatePlan(projectText.trim(), labIds);
      setResult(data);
      setStatus("done");
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  function handleReset() {
    setStatus("idle");
    setResult(null);
    setErrorMsg("");
    setProjectText("");
    setTimeout(() => textareaRef.current?.focus(), 100);
  }

  const plan        = result?.plan;
  const machineMeta = result?.machine_meta ?? {};
  const diffConf    = DIFFICULTY_CONFIG[plan?.difficulty] ?? DIFFICULTY_CONFIG.intermediate;

  return (
    <Sheet open onOpenChange={open => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full sm:w-[540px] flex flex-col p-0">

        {/* ── Header ── */}
        <SheetHeader className="px-6 py-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/25">
              <Sparkles size={17} className="text-purple-400" />
            </div>
            <div>
              <SheetTitle className="text-base">Plan a Project</SheetTitle>
              <SheetDescription className="text-xs mt-0.5">
                AI planner grounded in your lab machines
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* ── Body ── */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-5 space-y-5">

            {/* ── INPUT / ERROR STATE ── */}
            {(status === "idle" || status === "error") && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    What do you want to build?
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={projectText}
                    onChange={e => setProjectText(e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="e.g. an RC car, a drone, a smart irrigation system, a wooden shelf..."
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 resize-none transition-colors"
                  />
                  <div className="text-right text-[10px] text-slate-600">{projectText.length}/500</div>
                </div>

                {/* Lab selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Include machines from
                  </label>
                  <div className="flex gap-2">
                    {LAB_OPTIONS.map(opt => {
                      const Icon = opt.icon;
                      const active = selectedLab === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedLab(opt.id)}
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                            active
                              ? "border-purple-500/50 bg-purple-500/15 text-purple-300"
                              : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-300"
                          }`}
                        >
                          <Icon size={12} />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Error */}
                {status === "error" && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!projectText.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl py-5 gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Sparkles size={15} />
                  Generate Plan
                </Button>
              </form>
            )}

            {/* ── LOADING STATE ── */}
            {status === "loading" && (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/15 border border-purple-500/25">
                    <Loader2 size={22} className="text-purple-400 animate-spin" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Generating your plan…</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Matching project steps to available lab machines
                    </div>
                  </div>
                </div>
                <PlanSkeleton />
              </div>
            )}

            {/* ── RESULTS STATE ── */}
            {status === "done" && plan && (
              <div className="space-y-5">

                {/* Plan hero */}
                <div className="rounded-xl border border-purple-500/20 bg-purple-500/8 p-4 space-y-3">
                  <div className="flex items-start gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-white flex-1 min-w-0">
                      {plan.project_name}
                    </h2>
                    <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${diffConf.className}`}>
                      {diffConf.label}
                    </span>
                  </div>

                  {plan.overview && (
                    <p className="text-sm text-slate-300 leading-relaxed">{plan.overview}</p>
                  )}

                  <div className="flex gap-3">
                    <div className="flex flex-1 items-center gap-2 rounded-lg bg-black/30 border border-white/8 px-3 py-2.5">
                      <Clock size={14} className="text-blue-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide">Time</div>
                        <div className="text-xs font-semibold text-white">{plan.total_estimated_time}</div>
                      </div>
                    </div>
                    <div className="flex flex-1 items-center gap-2 rounded-lg bg-black/30 border border-white/8 px-3 py-2.5">
                      <IndianRupee size={14} className="text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide">Cost</div>
                        <div className="text-xs font-semibold text-white">{plan.total_estimated_cost}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phases */}
                {plan.phases?.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      Project Phases
                    </div>
                    {plan.phases.map(phase => (
                      <PhaseCard
                        key={phase.phase_number}
                        phase={phase}
                        machineMeta={machineMeta}
                        onMachineClick={onMachineClick}
                      />
                    ))}
                  </div>
                )}

                {/* Materials */}
                {plan.materials?.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      <Package size={11} /> Materials Needed
                    </div>
                    <ul className="space-y-1.5">
                      {plan.materials.map((m, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-500 shrink-0" />
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Safety notes */}
                {plan.safety_notes?.length > 0 && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
                      <AlertTriangle size={12} /> Safety Notes
                    </div>
                    <ul className="space-y-1.5">
                      {plan.safety_notes.map((n, i) => (
                        <li key={i} className="text-sm text-amber-200/80">{n}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Missing equipment */}
                {plan.missing_equipment?.length > 0 && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/8 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-400">
                      <AlertTriangle size={12} /> Equipment Not Available
                    </div>
                    <ul className="space-y-1.5">
                      {plan.missing_equipment.map((e, i) => (
                        <li key={i} className="text-sm text-red-200/80">{e}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Reset */}
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full border-white/15 text-slate-400 hover:text-white hover:border-white/25 rounded-xl py-5 gap-2"
                >
                  <RotateCcw size={13} />
                  Plan Another Project
                </Button>
              </div>
            )}

          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
