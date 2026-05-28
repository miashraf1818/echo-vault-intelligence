/**
 * Animated visualizer for the upload pipeline (parse → chunk → enrich →
 * embed → store).
 *
 * Driven entirely by `usePipelineStatus`, this component reads a
 * `PipelineStatus` snapshot and renders one cell per stage with:
 *
 *   • a state indicator (pending / active / complete / error)
 *   • a short label and a one-line description
 *   • the real backend timing (in ms) once the upload resolves, plus a
 *     percentage-of-total bar so the relative cost of each stage is visible
 *
 * Connectors between cells animate their fill as adjacent stages reach
 * `complete`, giving the visualizer a sense of forward motion. The pulse
 * ring on the active cell is intentionally slow (~1.8s) so the eye has
 * time to read it.
 *
 * Validates Requirements: 3.4, 9.5, 10.1.
 */

import { Fragment } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  Database,
  FileText,
  Layers,
  Network,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  PipelineStage,
  PipelineStatus,
  StageState,
} from "../../hooks/use-pipeline-status";
import type { PipelineTimings } from "../../services/api-client";

interface PipelineStagesProps {
  status: PipelineStatus;
  /** Optional class applied to the outer container for layout overrides. */
  className?: string;
}

interface StageDescriptor {
  id: PipelineStage;
  label: string;
  /** Short pill-style label used as the marquee title. */
  shortLabel: string;
  /** Sub-line shown below the title on tablet+ widths. */
  description: string;
  icon: LucideIcon;
  timingKey: keyof PipelineTimings;
}

const STAGE_DESCRIPTORS: StageDescriptor[] = [
  {
    id: "parse",
    label: "Parsing",
    shortLabel: "Parse",
    description: "Reading WhatsApp lines into structured messages",
    icon: FileText,
    timingKey: "parse_ms",
  },
  {
    id: "chunk",
    label: "Chunking",
    shortLabel: "Chunk",
    description: "Grouping by time and emotional continuity",
    icon: Layers,
    timingKey: "chunk_ms",
  },
  {
    id: "enrich",
    label: "Enrichment",
    shortLabel: "Enrich",
    description: "Tagging tone, intensity, and themes via Groq · LLaMA-3",
    icon: Sparkles,
    timingKey: "enrich_ms",
  },
  {
    id: "embed",
    label: "Embedding",
    shortLabel: "Embed",
    description: "Generating 384-dim BGE-small vectors",
    icon: Network,
    timingKey: "embed_ms",
  },
  {
    id: "store",
    label: "Storage",
    shortLabel: "Store",
    description: "Persisting to Qdrant + SQLite metadata",
    icon: Database,
    timingKey: "store_ms",
  },
];

function formatMs(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "0 ms";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(ms < 10_000 ? 2 : 1)} s`;
}

/** Reads the timing value for a stage if the backend has reported one. */
function timingFor(
  timings: PipelineTimings | null,
  key: keyof PipelineTimings,
): number | null {
  if (!timings) return null;
  const value = timings[key];
  return typeof value === "number" ? value : null;
}

function totalMs(timings: PipelineTimings | null): number {
  if (!timings) return 0;
  return STAGE_DESCRIPTORS.reduce(
    (sum, d) => sum + (timingFor(timings, d.timingKey) ?? 0),
    0,
  );
}

/**
 * Single stage cell. Decoupled from the row so the connector animation can
 * reach into both neighbors' state without prop-drilling the entire row.
 */
function StageCell({
  descriptor,
  state,
  timing,
  total,
  showTiming,
}: {
  descriptor: StageDescriptor;
  state: StageState;
  timing: number | null;
  total: number;
  showTiming: boolean;
}) {
  const Icon = descriptor.icon;

  // Tailwind-friendly color tokens per state. Kept as inline classes (rather
  // than data-attributes) so consumers can rely on Tailwind's purge.
  const wrapperCls =
    state === "complete"
      ? "border-foreground/80 bg-foreground text-background"
      : state === "active"
        ? "border-accent/60 bg-card text-accent shadow-[var(--shadow-glow)]"
        : state === "error"
          ? "border-destructive/60 bg-card text-destructive"
          : "border-border bg-card text-muted-foreground";

  const sharePct =
    showTiming && timing !== null && total > 0
      ? Math.max(2, Math.round((timing / total) * 100))
      : 0;

  return (
    <li className="flex min-w-0 flex-1 flex-col items-center text-center">
      <div className="relative">
        <motion.div
          layout
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={cn(
            "grid h-14 w-14 place-items-center rounded-full border transition-colors",
            wrapperCls,
          )}
          aria-label={`${descriptor.label}: ${state}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {state === "complete" ? (
              <motion.span
                key="check"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Check className="h-5 w-5" strokeWidth={2.5} />
              </motion.span>
            ) : state === "error" ? (
              <motion.span
                key="error"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <AlertCircle className="h-5 w-5" strokeWidth={2.5} />
              </motion.span>
            ) : (
              <motion.span
                key="icon"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Slow, deliberate pulse ring while the stage is the active one. */}
        {state === "active" && (
          <>
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full border border-accent/40"
              initial={{ opacity: 0.7, scale: 1 }}
              animate={{ opacity: 0, scale: 1.7 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full border border-accent/30"
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{ opacity: 0, scale: 1.7 }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.6,
              }}
            />
          </>
        )}
      </div>

      <div className="mt-3 min-w-0 w-full">
        <p
          className={cn(
            "truncate text-sm font-semibold tracking-tight",
            state === "pending" ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {/* On narrow viewports use the short label so it never truncates */}
          <span className="sm:hidden">{descriptor.shortLabel}</span>
          <span className="hidden sm:inline">{descriptor.label}</span>
        </p>
        <p className="mt-0.5 hidden text-[11px] leading-snug text-muted-foreground sm:block">
          {descriptor.description}
        </p>

        {/* Timing row — fixed height so layout doesn't jump between states. */}
        <div className="mt-2 h-5 text-xs tabular-nums">
          <AnimatePresence mode="wait" initial={false}>
            {showTiming && timing !== null ? (
              <motion.div
                key="timing"
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                transition={{ duration: 0.3 }}
                className="flex items-baseline justify-center gap-1.5"
              >
                <span className="font-medium text-foreground">
                  {formatMs(timing)}
                </span>
                {sharePct > 0 && (
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {sharePct}%
                  </span>
                )}
              </motion.div>
            ) : state === "active" ? (
              <motion.span
                key="active-dot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-accent"
              >
                <span className="inline-flex items-center gap-1.5">
                  <motion.span
                    className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  running
                </span>
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Share-of-total bar (only shown after completion). */}
        <div className="mx-auto mt-1 h-0.5 w-full max-w-[6rem] overflow-hidden rounded-full bg-border/60">
          <AnimatePresence>
            {showTiming && sharePct > 0 && (
              <motion.span
                key="share"
                className={cn(
                  "block h-full",
                  state === "complete" ? "bg-foreground" : "bg-accent",
                )}
                initial={{ width: 0 }}
                animate={{ width: `${sharePct}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </li>
  );
}

/**
 * Connector between two adjacent stage cells. Fills as the *previous* stage
 * reaches `complete`, providing a visual flow cue. Slowed to 0.9s so the
 * fill reads as a sweep rather than a snap.
 */
function StageConnector({ filled }: { filled: boolean }) {
  return (
    <li
      aria-hidden
      className="relative mx-1 hidden h-px flex-1 self-start overflow-hidden bg-border sm:block"
      style={{ marginTop: 28 /* visually align with the 56px circle center */ }}
    >
      <motion.span
        className="absolute inset-y-0 left-0 bg-foreground"
        initial={false}
        animate={{ width: filled ? "100%" : "0%" }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
    </li>
  );
}

export function PipelineStages({ status, className }: PipelineStagesProps) {
  const { stages, timings, isComplete } = status;
  const total = totalMs(timings);

  return (
    <section
      aria-label="Processing pipeline progress"
      className={cn("w-full", className)}
    >
      <ol className="flex items-start gap-2 sm:gap-0">
        {STAGE_DESCRIPTORS.map((descriptor, index) => {
          const state = stages[descriptor.id];
          const prev = STAGE_DESCRIPTORS[index - 1];
          const prevComplete = prev ? stages[prev.id] === "complete" : false;

          return (
            <Fragment key={descriptor.id}>
              {index > 0 && <StageConnector filled={prevComplete} />}
              <StageCell
                descriptor={descriptor}
                state={state}
                timing={timingFor(timings, descriptor.timingKey)}
                total={total}
                showTiming={isComplete && timings !== null}
              />
            </Fragment>
          );
        })}
      </ol>

      {isComplete && total > 0 && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-5 text-center text-xs text-muted-foreground"
        >
          End-to-end pipeline ran in{" "}
          <span className="font-medium text-foreground">{formatMs(total)}</span>
          .
        </motion.p>
      )}
    </section>
  );
}

export default PipelineStages;
