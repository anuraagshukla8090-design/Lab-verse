import React, { useState, useEffect, useRef } from "react";
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
  AlertTriangle,
  BookOpen,
  BotMessageSquare,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CheckSquare,
  Cpu,
  ExternalLink,
  FileText,
  GraduationCap,
  Info,
  Link2,
  Loader2,
  Send,
  Sparkles,
  Tag,
  Wrench,
} from "lucide-react";
import { chatWithMachine } from "@/lib/api";

/**
 * MachineSheet — Phase 2.2
 *
 * Right-side panel that displays machine information and an "Ask AI" tab
 * backed by the Phase 2.1 RAG pipeline.
 *
 * Props:
 *   machine  {object|null}  Merged machine data, or null when closed
 *   open     {bool}         Controls sheet open/close state
 *   onClose  {fn}           Called when the sheet should be closed
 */
export default function MachineSheet({ machine, open, onClose }) {
  // ------------------------------------------------------------------
  // Tab state
  // ------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState("overview");

  // ------------------------------------------------------------------
  // Ask AI state
  // ------------------------------------------------------------------
  const [question, setQuestion] = useState("");
  const [loading, setLoading]   = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiError, setAiError]       = useState(null);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const textareaRef = useRef(null);

  // Reset all AI state whenever the machine changes
  useEffect(() => {
    setActiveTab("overview");
    setQuestion("");
    setLoading(false);
    setAiResponse(null);
    setAiError(null);
    setSourcesOpen(false);
  }, [machine?.machine_id]);

  if (!machine) return null;

  // ------------------------------------------------------------------
  // Derived values
  // ------------------------------------------------------------------
  const complexityVariant = {
    beginner:     "success",
    intermediate: "warning",
    advanced:     "destructive",
  }[machine.complexity_level] || "secondary";

  const hasManual = machine.manual_path &&
    !machine.manual_path.includes("undefined");

  const hasSOP = machine.sop_path &&
    !machine.sop_path.includes("undefined");

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // ------------------------------------------------------------------
  // Ask AI handler
  // ------------------------------------------------------------------
  const handleAsk = async () => {
    const q = question.trim();
    if (!q || loading) return;

    setLoading(true);
    setAiResponse(null);
    setAiError(null);
    setSourcesOpen(false);

    try {
      const result = await chatWithMachine(machine.machine_id, q);
      setAiResponse(result);
    } catch (err) {
      // Surface backend error message when available; generic fallback otherwise
      const msg = err.message || "";
      if (msg.includes("rate") || msg.includes("429")) {
        setAiError("The AI service is temporarily busy. Please wait a moment and try again.");
      } else if (msg.includes("API key") || msg.includes("503")) {
        setAiError("The AI service is not configured. Please contact the lab administrator.");
      } else {
        setAiError("Unable to contact the AI service. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAsk();
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:w-[540px] flex flex-col p-0">

        {/* ---- Header ---- */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-start justify-between pr-6">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {machine.complexity_level && (
                  <Badge variant={complexityVariant} className="capitalize">
                    {machine.complexity_level}
                  </Badge>
                )}
                {machine.supervision_required && (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3" />
                    Supervisor Required
                  </Badge>
                )}
                {machine.category && (
                  <Badge variant="outline">{machine.category}</Badge>
                )}
              </div>

              <SheetTitle className="text-xl leading-tight">
                {machine.name || machine.machine_id}
              </SheetTitle>

              {machine.lab && (
                <SheetDescription className="flex items-center gap-1.5 text-slate-400">
                  <Wrench className="h-3.5 w-3.5" />
                  {machine.lab}
                </SheetDescription>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* ---- Tab Bar ---- */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-white/10 bg-white/[0.02]">
          <TabButton
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            icon={<Info className="h-3.5 w-3.5" />}
            label="Overview"
          />
          <TabButton
            active={activeTab === "askai"}
            onClick={() => { setActiveTab("askai"); setTimeout(() => textareaRef.current?.focus(), 50); }}
            icon={<Sparkles className="h-3.5 w-3.5" />}
            label="Ask AI"
            accent
          />
        </div>

        {/* ---- Scrollable Body ---- */}
        <ScrollArea className="flex-1 min-h-0">
          {activeTab === "overview" ? (
            <OverviewTab machine={machine} apiBase={apiBase} hasManual={hasManual} hasSOP={hasSOP} />
          ) : (
            <AskAITab
              machine={machine}
              question={question}
              setQuestion={setQuestion}
              loading={loading}
              aiResponse={aiResponse}
              aiError={aiError}
              sourcesOpen={sourcesOpen}
              setSourcesOpen={setSourcesOpen}
              handleAsk={handleAsk}
              handleKeyDown={handleKeyDown}
              textareaRef={textareaRef}
            />
          )}
        </ScrollArea>

      </SheetContent>
    </Sheet>
  );
}

// ------------------------------------------------------------------
// Tab button
// ------------------------------------------------------------------

function TabButton({ active, onClick, icon, label, accent = false }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
        transition-all duration-150 select-none
        ${active
          ? accent
            ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
            : "bg-white/10 text-white border border-white/20"
          : "text-slate-500 hover:text-slate-300 border border-transparent hover:bg-white/5"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}

// ------------------------------------------------------------------
// Overview tab — all existing content unchanged
// ------------------------------------------------------------------

function OverviewTab({ machine, apiBase, hasManual, hasSOP }) {
  return (
    <div className="px-6 py-5 flex flex-col gap-6">

      {/* Description */}
      {machine.description && (
        <Section icon={<Info className="h-4 w-4 text-blue-400" />} title="About">
          <p className="text-sm text-slate-300 leading-relaxed">
            {machine.description}
          </p>
        </Section>
      )}

      {/* Images */}
      {machine.images && machine.images.length > 0 && (
        <Section icon={<Cpu className="h-4 w-4 text-blue-400" />} title="Machine Images">
          <div className="grid grid-cols-2 gap-2">
            {machine.images.map((img, i) => (
              <div
                key={i}
                className="aspect-video rounded-lg overflow-hidden border border-white/10 bg-white/5"
              >
                <img
                  src={`${apiBase}${img}`}
                  alt={`${machine.name} image ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Specifications */}
      {machine.specs && Object.keys(machine.specs).length > 0 && (
        <Section icon={<Cpu className="h-4 w-4 text-blue-400" />} title="Specifications">
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(machine.specs).map(([key, val], i) => (
                  <tr
                    key={key}
                    className={i % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"}
                  >
                    <td className="px-4 py-2.5 font-medium text-slate-400 w-[45%] align-top border-r border-white/5">
                      {key}
                    </td>
                    <td className="px-4 py-2.5 text-slate-200 font-mono text-xs leading-relaxed">
                      {String(val)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Safety */}
      {machine.safety_summary && (
        <Section
          icon={<AlertTriangle className="h-4 w-4 text-amber-400" />}
          title="Safety Information"
          titleClass="text-amber-300"
        >
          <div className="rounded-xl bg-amber-950/20 border border-amber-500/20 p-4">
            <p className="text-sm text-amber-100/80 leading-relaxed whitespace-pre-line">
              {machine.safety_summary}
            </p>
          </div>
        </Section>
      )}

      {/* SOP Summary */}
      {machine.sop_summary && (
        <Section icon={<CheckSquare className="h-4 w-4 text-emerald-400" />} title="Operating Procedure">
          <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/20 p-4">
            <p className="text-sm text-emerald-100/80 leading-relaxed whitespace-pre-line">
              {machine.sop_summary}
            </p>
          </div>
        </Section>
      )}

      {/* Skills */}
      {(machine.skills_required?.length > 0 || machine.skills_taught?.length > 0) && (
        <Section icon={<GraduationCap className="h-4 w-4 text-blue-400" />} title="Skills">
          <div className="flex flex-col gap-3">
            {machine.skills_required?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Prerequisites
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {machine.skills_required.map((s) => (
                    <Badge key={s} variant="secondary">{formatSkill(s)}</Badge>
                  ))}
                </div>
              </div>
            )}
            {machine.skills_taught?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  You will learn
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {machine.skills_taught.map((s) => (
                    <Badge key={s} variant="default">
                      <ChevronRight className="h-2.5 w-2.5" />
                      {formatSkill(s)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Related Machines */}
      {machine.related_machines?.length > 0 && (
        <Section icon={<Link2 className="h-4 w-4 text-blue-400" />} title="Related Machines">
          <div className="flex flex-wrap gap-1.5">
            {machine.related_machines.map((m) => (
              <Badge key={m} variant="outline">{formatMachineId(m)}</Badge>
            ))}
          </div>
        </Section>
      )}

      {/* Tags */}
      {machine.tags?.length > 0 && (
        <Section icon={<Tag className="h-4 w-4 text-blue-400" />} title="Tags">
          <div className="flex flex-wrap gap-1.5">
            {machine.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-xs text-slate-400"
              >
                #{t}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Documents */}
      {(hasManual || hasSOP) && (
        <Section icon={<FileText className="h-4 w-4 text-blue-400" />} title="Documents">
          <div className="flex flex-col gap-2">
            {hasManual && (
              <a
                href={`${apiBase}${machine.manual_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 hover:bg-white/10 hover:border-blue-500/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  <span>Machine Manual</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </a>
            )}
            {hasSOP && (
              <a
                href={`${apiBase}${machine.sop_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 hover:bg-white/10 hover:border-emerald-500/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <CheckSquare className="h-4 w-4 text-emerald-400" />
                  <span>Standard Operating Procedure</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </a>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-600">
            Documents will be available after manuals are placed in{" "}
            <code className="font-mono">backend/static/docs/{machine.machine_id}/</code>
          </p>
        </Section>
      )}

      <div className="h-4" />
    </div>
  );
}

// ------------------------------------------------------------------
// Ask AI tab
// ------------------------------------------------------------------

function AskAITab({
  machine,
  question, setQuestion,
  loading,
  aiResponse, aiError,
  sourcesOpen, setSourcesOpen,
  handleAsk, handleKeyDown,
  textareaRef,
}) {
  const canAsk = question.trim().length > 0 && !loading;
  const isFallback = aiResponse && aiResponse.chunks_used === 0;

  return (
    <div className="px-6 py-5 flex flex-col gap-5">

      {/* Intro */}
      <div className="flex items-start gap-3 rounded-xl bg-violet-950/20 border border-violet-500/20 p-4">
        <BotMessageSquare className="h-5 w-5 text-violet-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-violet-200 mb-1">
            LabVerse AI Assistant
          </p>
          <p className="text-xs text-violet-300/70 leading-relaxed">
            Ask questions about the <span className="font-medium text-violet-200">{machine.name || machine.machine_id}</span> using the LabVerse AI knowledge base. Answers are grounded in the official machine documentation.
          </p>
        </div>
      </div>

      {/* Input area */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Your Question
        </label>
        <textarea
          ref={textareaRef}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`E.g. "How do I calibrate the ${machine.name || 'machine'}?" or "What are the safety precautions?"`}
          rows={3}
          className="
            w-full resize-none rounded-xl border border-white/10 bg-white/5
            px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600
            focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40
            transition-all duration-150 leading-relaxed
          "
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-600">
            Press <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">Ctrl+Enter</kbd> to send
          </p>
          <button
            onClick={handleAsk}
            disabled={!canAsk}
            className={`
              flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold
              transition-all duration-150
              ${canAsk
                ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40 hover:shadow-violet-800/50"
                : "bg-white/5 text-slate-600 cursor-not-allowed border border-white/10"
              }
            `}
          >
            {loading
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Asking…</>
              : <><Send className="h-3.5 w-3.5" /> Ask</>
            }
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="rounded-xl border border-violet-500/20 bg-violet-950/10 p-4 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 mb-1">
            <Loader2 className="h-4 w-4 text-violet-400 animate-spin" />
            <span className="text-xs text-violet-400 font-medium">Searching knowledge base…</span>
          </div>
          <div className="h-3 rounded-full bg-white/5 animate-pulse w-full" />
          <div className="h-3 rounded-full bg-white/5 animate-pulse w-4/5" />
          <div className="h-3 rounded-full bg-white/5 animate-pulse w-3/5" />
        </div>
      )}

      {/* Error state */}
      {aiError && !loading && (
        <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-4 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300/90 leading-relaxed">{aiError}</p>
        </div>
      )}

      {/* Answer */}
      {aiResponse && !loading && (
        <div className="flex flex-col gap-3">
          {/* Answer card */}
          <div className={`
            rounded-xl border p-4 flex flex-col gap-3
            ${isFallback
              ? "border-slate-500/20 bg-slate-900/40"
              : "border-violet-500/20 bg-violet-950/10"
            }
          `}>
            {/* Answer header */}
            <div className="flex items-center gap-2">
              <Sparkles className={`h-3.5 w-3.5 ${isFallback ? "text-slate-500" : "text-violet-400"}`} />
              <span className={`text-xs font-semibold uppercase tracking-wider ${isFallback ? "text-slate-500" : "text-violet-400"}`}>
                {isFallback ? "No Match Found" : `Answer · ${aiResponse.chunks_used} source${aiResponse.chunks_used !== 1 ? "s" : ""} used`}
              </span>
            </div>

            {/* Answer text */}
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {aiResponse.answer}
            </p>
          </div>

          {/* Sources collapsible — only when we have real sources */}
          {!isFallback && aiResponse.sources?.length > 0 && (
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setSourcesOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
              >
                <span className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Sources Used ({aiResponse.sources.length})
                </span>
                {sourcesOpen
                  ? <ChevronUp className="h-3.5 w-3.5" />
                  : <ChevronDown className="h-3.5 w-3.5" />
                }
              </button>

              {sourcesOpen && (
                <div className="border-t border-white/10">
                  {aiResponse.sources.map((src, i) => (
                    <div
                      key={i}
                      className={`
                        flex items-center justify-between px-4 py-2 text-xs
                        ${i % 2 === 0 ? "bg-white/[0.02]" : ""}
                      `}
                    >
                      <span className="text-slate-400 font-mono truncate mr-3">
                        {src.source}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-slate-600">chunk {src.chunk_index}</span>
                        <span className={`
                          font-semibold tabular-nums
                          ${src.score >= 0.6 ? "text-emerald-400" : src.score >= 0.4 ? "text-amber-400" : "text-slate-500"}
                        `}>
                          {(src.score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}

// ------------------------------------------------------------------
// Sub-components
// ------------------------------------------------------------------

function Section({ icon, title, titleClass = "text-white", children }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className={`text-sm font-semibold tracking-wide ${titleClass}`}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

// ------------------------------------------------------------------
// Formatters
// ------------------------------------------------------------------

function formatSkill(s) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatMachineId(id) {
  return id
    .replace(/_\d+$/, "")        // remove trailing _01
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
