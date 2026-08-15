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
  ShoppingCart,
  ExternalLink,
  Lightbulb,
  Check,
  Copy,
  Layers,
  ShieldAlert,
  Gauge,
  ListOrdered,
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
    <div className="space-y-3 pt-2">
      <Skeleton className="h-7 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}

// ── Helper to extract step text and verification ──────────────────────────────
function parseStepItem(step) {
  if (typeof step === "string") {
    return { text: step, success: null };
  }
  if (!step || typeof step !== "object") {
    return { text: String(step), success: null };
  }
  const text =
    step.action ||
    step.instruction ||
    step.description ||
    step.text ||
    step.details ||
    step.title ||
    (typeof step.step === "string" ? step.step : null) ||
    step.name ||
    JSON.stringify(step);

  const success =
    step.success_criteria ||
    step.success ||
    step.verification ||
    step.check ||
    step.verification_criteria ||
    null;

  return { text, success };
}

// ── Phase card (Step-by-Step Instructions) ───────────────────────────────────
function PhaseCard({ phase, machineMeta, onMachineClick }) {
  const [open, setOpen] = useState(true);

  // Extract steps from any common array key
  const rawSteps =
    phase.steps ||
    phase.tasks ||
    phase.substeps ||
    phase.actions ||
    phase.instructions ||
    phase.details ||
    [];

  const stepsList = Array.isArray(rawSteps) ? rawSteps : [rawSteps];

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all max-w-full">
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left hover:bg-white/5 transition-colors cursor-pointer"
      >
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-xs font-bold text-purple-300 border border-purple-500/30">
          {phase.phase_number || "•"}
        </div>
        <div className="flex-1 min-w-0 pr-2">
          <div className="text-xs font-bold text-white leading-tight break-words">{phase.title || "Phase"}</div>
          {phase.duration && (
            <div className="flex items-center gap-1 text-[10px] text-purple-400/80 mt-0.5 font-medium">
              <Clock size={10} /> {phase.duration}
            </div>
          )}
        </div>
        {open
          ? <ChevronUp size={14} className="text-slate-400 shrink-0" />
          : <ChevronDown size={14} className="text-slate-400 shrink-0" />}
      </button>

      {/* Body */}
      {open && (
        <div className="px-3.5 pb-3.5 space-y-3 border-t border-white/8 max-w-full">
          {/* Detailed Step-by-Step instructions */}
          <div className="space-y-2 pt-2.5">
            {stepsList.length === 0 && (
              <div className="text-xs text-slate-400 italic py-1">No specific sub-steps listed for this phase.</div>
            )}
            {stepsList.map((rawStep, i) => {
              const { text, success } = parseStepItem(rawStep);
              return (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 bg-black/40 border border-white/5 rounded-lg p-2.5 max-w-full overflow-hidden">
                  <div className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-purple-950 text-[10px] font-bold text-purple-300 border border-purple-500/40 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1 break-words">
                    <p className="leading-relaxed whitespace-normal">{text}</p>
                    {success && (
                      <div className="flex items-start gap-1.5 text-[11px] text-emerald-400/90 font-medium pt-0.5">
                        <CheckCircle2 size={11} className="shrink-0 mt-0.5" />
                        <span className="break-words">Check: {success}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Machine chips in this phase */}
          {(phase.machines || phase.machine_ids)?.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                Equipment:
              </span>
              {(phase.machines || phase.machine_ids).map(mid => {
                const meta = machineMeta?.[mid];
                return (
                  <button
                    key={mid}
                    title={`Click to view ${meta?.name || mid} in 3D viewer`}
                    onClick={() => onMachineClick?.(mid)}
                    className="inline-flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-[10px] font-medium text-cyan-300 hover:bg-cyan-900/60 hover:border-cyan-400/60 transition-all cursor-pointer active:scale-95"
                  >
                    <Wrench size={9} className="shrink-0" />
                    <span className="truncate max-w-[140px]">{meta?.name || mid}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Pro Tip */}
          {(phase.pro_tip || phase.tips || phase.tip) && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 text-[11px] text-amber-200/90 max-w-full">
              <Lightbulb size={12} className="text-amber-400 shrink-0 mt-0.5" />
              <span className="break-words leading-relaxed"><strong className="text-amber-300">Tip:</strong> {phase.pro_tip || phase.tips || phase.tip}</span>
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
  const [copied, setCopied]           = useState(false);
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

  // Equipment & Materials
  const inLabEquipment = plan?.in_lab_equipment || [];
  const materials = plan?.materials_to_buy || plan?.materials || [];
  const missingEquip = plan?.missing_equipment || [];

  function handleCopyMarkdown() {
    if (!plan) return;
    let md = `# ${plan.project_name}\n`;
    if (plan.tagline) md += `*${plan.tagline}*\n\n`;
    if (plan.innovation_angle) md += `### 💡 Innovation Edge\n${plan.innovation_angle}\n\n`;
    md += `**Difficulty:** ${plan.difficulty} | **Estimated Time:** ${plan.total_estimated_time} | **Estimated Cost:** ${plan.total_estimated_cost}\n\n`;
    md += `## Overview\n${plan.overview}\n\n`;

    if (inLabEquipment.length > 0) {
      md += `## 🛠️ Lab Equipment Available\n`;
      inLabEquipment.forEach(eq => {
        md += `- **${eq.name || eq.machine_id}**: ${eq.role || "Used for project fabrication"}\n`;
      });
      md += `\n`;
    }

    if (materials.length > 0) {
      md += `## 🛒 Bill of Materials & Items to Buy\n`;
      materials.forEach(m => {
        const item = typeof m === "string" ? m : m.item;
        const qty = m.quantity ? ` (Qty: ${m.quantity})` : "";
        const cost = m.estimated_cost ? ` - ${m.estimated_cost}` : "";
        const vendor = m.where_to_buy ? ` [Vendor: ${m.where_to_buy}]` : "";
        md += `- **${item}**${qty}${cost}${vendor}\n`;
      });
      md += `\n`;
    }

    if (plan.phases?.length > 0) {
      md += `## 📋 Step-by-Step Execution Plan\n`;
      plan.phases.forEach(p => {
        md += `### Phase ${p.phase_number}: ${p.title} (${p.duration || ""})\n`;
        (p.steps || []).forEach((st, idx) => {
          const act = typeof st === "string" ? st : st.action;
          md += `${idx + 1}. ${act}\n`;
        });
        if (p.pro_tip || p.tips) md += `> **Tip:** ${p.pro_tip || p.tips}\n\n`;
      });
    }

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Sheet open onOpenChange={open => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full sm:w-[560px] max-w-[100vw] flex flex-col p-0 bg-[#0c1017] border-l border-white/10 overflow-x-hidden">

        {/* ── Header ── */}
        <SheetHeader className="px-5 py-4 border-b border-white/10 shrink-0 bg-black/50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/15 border border-purple-500/25">
                <Sparkles size={16} className="text-purple-400" />
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-sm font-bold text-white truncate">AI Project Planner</SheetTitle>
                <SheetDescription className="text-[11px] text-slate-400 truncate">
                  Engineering studio plans mapped to your lab
                </SheetDescription>
              </div>
            </div>

            {status === "done" && plan && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyMarkdown}
                className="border-white/15 bg-white/5 hover:bg-white/10 text-xs text-slate-300 gap-1.5 h-7.5 px-2.5 shrink-0 cursor-pointer"
                title="Copy plan to clipboard"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* ── Body ── */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-5 py-4 space-y-4 max-w-full overflow-hidden">

            {/* ── INPUT / ERROR STATE ── */}
            {(status === "idle" || status === "error") && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    What would you like to build?
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={projectText}
                    onChange={e => setProjectText(e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="e.g. Autonomous line follower robot with PID control, smart IoT hydroponics system, robotic arm with gripper, drone chassis..."
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 resize-none transition-colors"
                  />
                  <div className="text-right text-[10px] text-slate-600">{projectText.length}/500</div>
                </div>

                {/* Lab selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Include Equipment From
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
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                            active
                              ? "border-purple-500/50 bg-purple-500/20 text-purple-200 shadow-md shadow-purple-950/40"
                              : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-300"
                          }`}
                        >
                          <Icon size={12} />
                          <span className="truncate">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Error */}
                {status === "error" && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-300">
                    <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                    <span className="break-words">{errorMsg}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!projectText.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl py-4.5 gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-900/30 cursor-pointer text-xs"
                >
                  <Sparkles size={15} />
                  Architect Project Plan
                </Button>
              </form>
            )}

            {/* ── LOADING STATE ── */}
            {status === "loading" && (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-2.5 py-3 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30">
                    <Loader2 size={20} className="text-purple-400 animate-spin" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Architecting Innovative Plan…</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Synthesizing BOM, vendor pricing, and step-by-step fabrication
                    </div>
                  </div>
                </div>
                <PlanSkeleton />
              </div>
            )}

            {/* ── RESULTS STATE ── */}
            {status === "done" && plan && (
              <div className="space-y-4 animate-fade-in max-w-full overflow-hidden">

                {/* 1. Plan Hero Header */}
                <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-black/40 to-indigo-950/30 p-3.5 space-y-2.5 shadow-lg max-w-full">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-bold text-white leading-tight break-words">
                        {plan.project_name}
                      </h2>
                      {plan.tagline && (
                        <p className="text-[11px] text-purple-300/90 font-medium mt-0.5 break-words">{plan.tagline}</p>
                      )}
                    </div>
                    <span className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${diffConf.className}`}>
                      {diffConf.label}
                    </span>
                  </div>

                  {/* Innovation Angle Highlight */}
                  {plan.innovation_angle && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 flex items-start gap-2 max-w-full">
                      <Lightbulb size={14} className="text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                          Innovation Edge
                        </div>
                        <p className="text-[11px] text-amber-100/90 leading-relaxed break-words">{plan.innovation_angle}</p>
                      </div>
                    </div>
                  )}

                  {plan.overview && (
                    <p className="text-xs text-slate-300 leading-relaxed break-words">{plan.overview}</p>
                  )}

                  {/* Metrics Pills */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <div className="flex items-center gap-2 rounded-lg bg-black/40 border border-white/10 px-2.5 py-2 min-w-0">
                      <Clock size={13} className="text-blue-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[9px] text-slate-500 uppercase font-bold">Estimated Time</div>
                        <div className="text-xs font-semibold text-white truncate">{plan.total_estimated_time}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-black/40 border border-white/10 px-2.5 py-2 min-w-0">
                      <IndianRupee size={13} className="text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[9px] text-slate-500 uppercase font-bold">Total Cost</div>
                        <div className="text-xs font-semibold text-emerald-300 truncate">{plan.total_estimated_cost}</div>
                      </div>
                    </div>
                  </div>

                  {/* Compact In-Lab Equipment Chips (Small & Minimal) */}
                  {inLabEquipment.length > 0 && (
                    <div className="pt-1 border-t border-white/8 space-y-1">
                      <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                        Available In Lab:
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {inLabEquipment.map((eq, i) => (
                          <button
                            key={i}
                            title={`Jump to ${eq.name || eq.machine_id} in 3D viewer`}
                            onClick={() => onMachineClick?.(eq.machine_id)}
                            className="inline-flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-950/60 px-2 py-0.5 text-[10px] font-medium text-cyan-300 hover:bg-cyan-900/80 hover:border-cyan-400/50 transition-all cursor-pointer active:scale-95"
                          >
                            <Wrench size={9} className="shrink-0 text-cyan-400" />
                            <span className="truncate max-w-[130px]">{eq.name || eq.machine_id}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Step-by-Step Instructions (WHAT TO DO) — Hero Focus */}
                {plan.phases?.length > 0 && (
                  <div className="space-y-2 max-w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-300">
                        <ListOrdered size={14} className="text-purple-400" /> Step-by-Step Guide (What to Do)
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">{plan.phases.length} phases</span>
                    </div>

                    <div className="space-y-2">
                      {plan.phases.map(phase => (
                        <PhaseCard
                          key={phase.phase_number}
                          phase={phase}
                          machineMeta={machineMeta}
                          onMachineClick={onMachineClick}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. What We Need to Buy (Bill of Materials & Vendors) */}
                {materials.length > 0 && (
                  <div className="space-y-2 max-w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                        <ShoppingCart size={13} className="text-emerald-400" /> Components & Materials to Buy
                      </div>
                      <span className="text-[10px] text-slate-500">{materials.length} items</span>
                    </div>

                    <div className="space-y-1.5">
                      {materials.map((m, i) => {
                        if (typeof m === "string") {
                          return (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-white/[0.02] border border-white/5 rounded-lg p-2 max-w-full break-words">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                              <span className="break-words">{m}</span>
                            </div>
                          );
                        }
                        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent((m.item || "") + " buy online India")}`;
                        return (
                          <div key={i} className="rounded-xl border border-white/8 bg-white/[0.02] p-2.5 flex flex-col gap-1.5 hover:bg-white/[0.04] transition-colors max-w-full">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0 pr-1">
                                <div className="text-xs font-semibold text-white break-words">{m.item}</div>
                                {m.why_needed && (
                                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug break-words">{m.why_needed}</p>
                                )}
                              </div>
                              {m.estimated_cost && (
                                <div className="shrink-0 text-[11px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-md px-2 py-0.5 whitespace-nowrap">
                                  {m.estimated_cost}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5 text-[10px] text-slate-500 flex-wrap">
                              <div className="flex items-center gap-1.5 min-w-0">
                                {m.quantity && <span>Qty: <strong className="text-slate-300">{m.quantity}</strong></span>}
                                {m.where_to_buy && <span className="truncate max-w-[180px]">• Vendor: <strong className="text-slate-300">{m.where_to_buy}</strong></span>}
                              </div>
                              <a
                                href={searchUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 font-medium ml-auto shrink-0"
                              >
                                Find Vendor <ExternalLink size={9} />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Missing Tools & Workarounds (if any) */}
                {missingEquip.length > 0 && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 p-3 space-y-1.5 max-w-full">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                      <AlertTriangle size={12} /> Missing Tools & Workarounds
                    </div>
                    <div className="space-y-1">
                      {missingEquip.map((me, i) => {
                        const item = typeof me === "string" ? me : me.item;
                        const workaround = typeof me === "object" ? me.workaround : null;
                        return (
                          <div key={i} className="text-[11px] text-amber-200/90 leading-relaxed break-words">
                            <strong>• {item}:</strong> {workaround || "Use lab alternatives or manual fabrication."}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. Testing & Calibration */}
                {plan.testing_and_calibration?.length > 0 && (
                  <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-3 space-y-1.5 max-w-full">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400">
                      <Gauge size={12} /> Testing & Verification Checklist
                    </div>
                    <ul className="space-y-1">
                      {plan.testing_and_calibration.map((t, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-blue-200/90 leading-relaxed break-words">
                          <CheckCircle2 size={11} className="text-blue-400 shrink-0 mt-0.5" />
                          <span className="break-words">{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 6. Safety Notes */}
                {(plan.safety_notes || plan.safety_precautions)?.length > 0 && (
                  <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 space-y-1.5 max-w-full">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400">
                      <ShieldAlert size={12} /> Safety Precautions
                    </div>
                    <ul className="space-y-1">
                      {(plan.safety_notes || plan.safety_precautions).map((n, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-red-200/90 leading-relaxed break-words">
                          <AlertTriangle size={11} className="text-red-400 shrink-0 mt-0.5" />
                          <span className="break-words">{n}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Reset Button */}
                <div className="pt-1">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="w-full border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl py-3.5 gap-1.5 text-xs font-semibold cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    Plan Another Project
                  </Button>
                </div>
              </div>
            )}

          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
