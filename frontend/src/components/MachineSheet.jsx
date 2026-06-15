import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  BookOpen,
  CheckSquare,
  ChevronRight,
  Cpu,
  ExternalLink,
  FileText,
  GraduationCap,
  Info,
  Link2,
  Tag,
  Wrench,
} from "lucide-react";

/**
 * MachineSheet
 *
 * Shadcn Sheet (right-side panel) that displays full machine information
 * when a hotspot is clicked. Receives merged machine data from the API
 * (machines.json + machine_content.json merged by the backend).
 *
 * Props:
 *   machine  {object|null}  Merged machine data object, or null when closed
 *   open     {bool}         Controls sheet open/close state
 *   onClose  {fn}           Called when the sheet should be closed
 */
export default function MachineSheet({ machine, open, onClose }) {
  if (!machine) return null;

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

        {/* ---- Scrollable Body ---- */}
        <ScrollArea className="flex-1 min-h-0">
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
                          className={
                            i % 2 === 0
                              ? "bg-white/[0.02]"
                              : "bg-transparent"
                          }
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
            {(machine.skills_required?.length > 0 ||
              machine.skills_taught?.length > 0) && (
              <Section icon={<GraduationCap className="h-4 w-4 text-blue-400" />} title="Skills">
                <div className="flex flex-col gap-3">
                  {machine.skills_required?.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Prerequisites
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {machine.skills_required.map((s) => (
                          <Badge key={s} variant="secondary">
                            {formatSkill(s)}
                          </Badge>
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
                    <Badge key={m} variant="outline">
                      {formatMachineId(m)}
                    </Badge>
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

            {/* Spacer */}
            <div className="h-4" />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
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
