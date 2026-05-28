/**
 * `MemoryChunkCard` — visual representation of a single `MemoryChunk`.
 *
 * Renders, per the design's chunk-card contract:
 *  - The time span the chunk covers (start → end, formatted via `date-fns`)
 *  - A short excerpt of the chunk text (truncated to ~120 chars)
 *  - A color-coded primary-tone badge
 *  - An intensity meter (shadcn `Progress`)
 *  - The chunk's thematic tags as `Badge`s
 *
 * When `isSelected` is true, the card expands to show the full chunk text.
 *
 * Validates Requirements: 4.5 (emotional tags + intensity displayed),
 *                         5.5 (chunk metadata surfaced),
 *                         6.5 (chunk card used as a search-result card).
 */

import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";

import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";
import type { EmotionalTone, MemoryChunk } from "../../services/api-client";

export interface MemoryChunkCardProps {
  chunk: MemoryChunk;
  /** When true, expands the card to show the full chunk text. */
  isSelected?: boolean;
  /** Click handler — used by `ChunkList` to toggle the selected chunk. */
  onSelect?: () => void;
}

const EXCERPT_LIMIT = 120;

/**
 * Tone → color tokens. Uses Tailwind utility colors so we stay independent of
 * the theme variables; the design doc names blue/amber/emerald for three
 * reference tones, the rest are mapped to harmonising hues.
 */
const TONE_STYLES: Record<EmotionalTone, { className: string; label: string }> = {
  reflective: {
    className: "bg-blue-500/15 text-blue-700 border-blue-500/30",
    label: "Reflective",
  },
  encouraging: {
    className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    label: "Encouraging",
  },
  anxious: {
    className: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    label: "Anxious",
  },
  grateful: {
    className: "bg-rose-500/15 text-rose-700 border-rose-500/30",
    label: "Grateful",
  },
  uncertain: {
    className: "bg-slate-500/15 text-slate-700 border-slate-500/30",
    label: "Uncertain",
  },
  joyful: {
    className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    label: "Joyful",
  },
  grieving: {
    className: "bg-indigo-500/15 text-indigo-700 border-indigo-500/30",
    label: "Grieving",
  },
  determined: {
    className: "bg-violet-500/15 text-violet-700 border-violet-500/30",
    label: "Determined",
  },
};

/** Truncate to ~120 chars on a word boundary, appending an ellipsis. */
function buildExcerpt(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= EXCERPT_LIMIT) return trimmed;
  const slice = trimmed.slice(0, EXCERPT_LIMIT);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > EXCERPT_LIMIT * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${cut.trimEnd()}…`;
}

/** Format an ISO timestamp; falls back to the raw string if parsing fails. */
function safeFormat(iso: string, pattern: string): string {
  try {
    return format(parseISO(iso), pattern);
  } catch {
    return iso;
  }
}

/** Compose a compact "Mar 12 → Apr 02, 2024" label for the chunk's time span. */
function formatTimeSpan(start: string, end: string): string {
  const startStr = safeFormat(start, "MMM d, yyyy");
  const endStr = safeFormat(end, "MMM d, yyyy");
  if (startStr === endStr) return startStr;
  return `${startStr} → ${endStr}`;
}

/** Clamp an intensity value to the 0..1 range expected by `Progress`. */
function clampIntensity(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export function MemoryChunkCard({
  chunk,
  isSelected = false,
  onSelect,
}: MemoryChunkCardProps) {
  const intensity = clampIntensity(chunk.intensity);
  const intensityPct = Math.round(intensity * 100);
  const toneStyle = chunk.primary_tone ? TONE_STYLES[chunk.primary_tone] : null;
  const isInteractive = typeof onSelect === "function";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Card
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        aria-pressed={isInteractive ? isSelected : undefined}
        onClick={isInteractive ? onSelect : undefined}
        onKeyDown={
          isInteractive
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect?.();
                }
              }
            : undefined
        }
        className={[
          "glass glow-border transition-shadow",
          isInteractive ? "cursor-pointer hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" : "",
          isSelected ? "ring-2 ring-ring shadow-md" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{formatTimeSpan(chunk.start_time, chunk.end_time)}</span>
            <span className="uppercase tracking-wide">{chunk.source}</span>
          </div>

          <p
            className={[
              "text-sm leading-relaxed text-foreground",
              isSelected ? "whitespace-pre-wrap" : "line-clamp-3",
            ].join(" ")}
          >
            {isSelected ? chunk.text : buildExcerpt(chunk.text)}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {toneStyle ? (
              <Badge variant="outline" className={toneStyle.className}>
                {toneStyle.label}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Untagged
              </Badge>
            )}
            {chunk.themes.map((theme) => (
              <Badge key={theme} variant="secondary" className="capitalize">
                {theme}
              </Badge>
            ))}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Intensity</span>
              <span aria-label={`Intensity ${intensityPct} percent`}>
                {intensityPct}%
              </span>
            </div>
            <Progress value={intensityPct} aria-label="Emotional intensity" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
