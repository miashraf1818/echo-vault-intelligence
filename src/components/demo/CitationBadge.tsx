import { format, isValid, parseISO } from "date-fns";
import { Quote } from "lucide-react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

import type { Citation } from "../../services/api-client";

interface CitationBadgeProps {
  /** Citation returned from `POST /api/v1/chat/reflect`. */
  citation: Citation;
  /** Optional extra classes for the trigger pill. */
  className?: string;
}

/**
 * Color-coded confidence pill rendered inline with a reflection answer.
 *
 * Color mapping (per design's color signal palette):
 * - confidence ≥ 0.9   → emerald  (`--emerald` token)
 * - confidence ≥ 0.7   → cobalt   (`--accent`  token)
 * - confidence < 0.7   → muted    (`--muted-foreground` token)
 *
 * The badge surfaces enough context inline (source kind icon + short label
 * + month-day + confidence percent) that a viewer can read the citation
 * at a glance. Hovering or focusing the pill opens a HoverCard with the
 * full source descriptor, longer date, and supporting excerpt.
 *
 * Validates Requirements: 7.7, 10.5.
 */
export function CitationBadge({ citation, className }: CitationBadgeProps) {
  const tier = confidenceTier(citation.confidence);
  const percent = Math.round(clamp01(citation.confidence) * 100);
  const shortDate = formatDate(citation.date, "MMM d");
  const longDate = formatDate(citation.date, "MMM d, yyyy");
  const { kind, shortLabel, fullLabel } = parseSource(citation.source);
  const KindIcon = SOURCE_ICONS[kind] ?? SOURCE_ICONS.other;

  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          aria-label={`Citation from ${fullLabel} on ${longDate}, confidence ${percent}%`}
          className={cn(
            "inline-flex max-w-full select-none items-center gap-1.5 rounded-full border px-2 py-0.5 align-baseline text-[11px] font-medium leading-none transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
            TIER_CLASSES[tier],
            className,
          )}
          data-confidence-tier={tier}
        >
          <KindIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="truncate max-w-[7rem]">{shortLabel}</span>
          <span aria-hidden className="opacity-60">·</span>
          <span className="tabular-nums">{shortDate}</span>
          <span
            aria-hidden
            className="rounded-full bg-foreground/5 px-1 py-0.5 text-[10px] tabular-nums"
          >
            {percent}%
          </span>
        </button>
      </HoverCardTrigger>

      <HoverCardContent
        align="start"
        sideOffset={6}
        className="glass glow-border w-72 space-y-2 rounded-xl p-3 text-xs"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
            <Quote className="h-3 w-3 text-muted-foreground" aria-hidden />
            {fullLabel}
          </span>
          <span
            className={cn(
              "rounded-full border px-1.5 py-0.5 text-[10px] font-medium leading-none",
              TIER_CLASSES[tier],
            )}
          >
            {percent}%
          </span>
        </div>

        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {longDate}
        </div>

        <p className="text-xs leading-relaxed text-foreground/90">
          “{citation.excerpt}”
        </p>
      </HoverCardContent>
    </HoverCard>
  );
}

export default CitationBadge;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Tier = "high" | "medium" | "low";

/**
 * Confidence → tier mapping. The thresholds match the design system:
 * 0.9 and 0.7 are inclusive lower bounds (≥0.9 emerald, ≥0.7 cobalt).
 */
export function confidenceTier(confidence: number): Tier {
  const value = clamp01(confidence);
  if (value >= 0.9) return "high";
  if (value >= 0.7) return "medium";
  return "low";
}

const TIER_CLASSES: Record<Tier, string> = {
  // ≥ 0.9 — emerald token defined in styles.css
  high: "border-emerald/40 bg-emerald/10 text-emerald hover:bg-emerald/15",
  // 0.7–0.9 — cobalt accent
  medium: "border-accent/40 bg-accent/10 text-accent hover:bg-accent/15",
  // < 0.7 — muted, low-confidence inferences
  low: "border-border bg-muted text-muted-foreground hover:bg-muted/80",
};

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function formatDate(raw: string, pattern: string): string {
  // Backend emits ISO-8601 strings; tolerate non-ISO inputs as a defensive
  // fallback so the badge never crashes the chat surface.
  const parsed = parseISO(raw);
  if (isValid(parsed)) return format(parsed, pattern);
  const fallback = new Date(raw);
  return isValid(fallback) ? format(fallback, pattern) : raw;
}

// ---------------------------------------------------------------------------
// Source parsing
// ---------------------------------------------------------------------------

import { FileText, Mic, NotebookPen } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type SourceKind = "whatsapp" | "journal" | "voice" | "other";

const SOURCE_ICONS: Record<SourceKind, LucideIcon> = {
  whatsapp: FileText,
  journal: NotebookPen,
  voice: Mic,
  other: FileText,
};

function parseSource(source: string): {
  kind: SourceKind;
  shortLabel: string;
  fullLabel: string;
} {
  // The backend emits "<kind>:<descriptor>" — e.g. "whatsapp:demo.txt",
  // "journal:2024-01-15", "voice:2024-04-11".
  const colon = source.indexOf(":");
  if (colon < 0) {
    return { kind: "other", shortLabel: source, fullLabel: source };
  }
  const rawKind = source.slice(0, colon).toLowerCase();
  const descriptor = source.slice(colon + 1);

  const kind: SourceKind =
    rawKind === "whatsapp" || rawKind === "journal" || rawKind === "voice"
      ? rawKind
      : "other";

  const labels: Record<SourceKind, { short: string; full: string }> = {
    whatsapp: {
      short: descriptor || "WhatsApp",
      full: `WhatsApp · ${descriptor || "export"}`,
    },
    journal: { short: "Journal", full: `Journal · ${descriptor}` },
    voice: { short: "Voice note", full: `Voice note · ${descriptor}` },
    other: { short: descriptor || source, full: source },
  };
  return {
    kind,
    shortLabel: labels[kind].short,
    fullLabel: labels[kind].full,
  };
}
