/**
 * Before/after view that contrasts the raw parsed messages from an upload
 * with the resulting emotional chunks.
 *
 * Two tabs:
 *   1. "Raw messages"     — every parsed message in chronological order,
 *                           formatted as `[timestamp] sender: content`.
 *   2. "Emotional chunks" — one card per chunk, each annotated with the
 *                           `boundary_reason` that produced its boundary,
 *                           plus the chunk's `primary_tone` if the
 *                           enricher assigned one.
 *
 * Boundary annotations between chunks are color- and icon-coded by reason
 * so the chunking story (where the system chose to split, and why) reads
 * at a glance instead of as flat grey text.
 *
 * Validates Requirements: 9.5, 10.1, 10.2, 10.3.
 */

import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import {
  AlignJustify,
  Clock,
  Hash,
  Layers,
  MessageSquare,
  Minus,
  Sparkles,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type {
  BoundaryReason,
  EmotionalTone,
  MemoryChunk,
  Message,
} from "../../services/api-client";

interface BeforeAfterCompareProps {
  messages: Message[];
  chunks: MemoryChunk[];
  /** Optional default tab. Defaults to "chunks" — the after side is the story. */
  defaultTab?: "raw" | "chunks";
  /** Optional class applied to the outer container. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Boundary metadata (label, helper copy, icon, color tokens)
// ---------------------------------------------------------------------------

interface BoundaryMeta {
  label: string;
  description: string;
  icon: LucideIcon;
  /** Tailwind classes for the inline pill. */
  pillClassName: string;
  /** Tailwind classes for the connector rule colour. */
  ruleClassName: string;
  /** Tailwind classes for the legend swatch. */
  swatchClassName: string;
}

const BOUNDARY_META: Record<BoundaryReason, BoundaryMeta> = {
  time_gap: {
    label: "Time gap",
    description: "Conversation paused for more than 30 minutes.",
    icon: Clock,
    pillClassName:
      "border-accent/40 bg-accent/10 text-accent",
    ruleClassName: "bg-accent/30",
    swatchClassName: "bg-accent",
  },
  emotional_shift: {
    label: "Emotional shift",
    description: "Detected tone changed between consecutive messages.",
    icon: Sparkles,
    pillClassName:
      "border-violet/40 bg-violet/10 text-foreground",
    ruleClassName: "bg-violet/30",
    swatchClassName: "bg-violet",
  },
  size_limit: {
    label: "Size limit",
    description: "Chunk reached the 50-message ceiling.",
    icon: Hash,
    pillClassName:
      "border-amber-500/50 bg-amber-100 text-amber-900",
    ruleClassName: "bg-amber-400/40",
    swatchClassName: "bg-amber-500",
  },
  end_of_stream: {
    label: "End of stream",
    description: "Final chunk — no more messages follow.",
    icon: Timer,
    pillClassName: "border-border bg-muted text-muted-foreground",
    ruleClassName: "bg-border",
    swatchClassName: "bg-muted-foreground/60",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtTimestamp(iso: string, pattern = "MMM d, yyyy · HH:mm"): string {
  try {
    const date = parseISO(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return format(date, pattern);
  } catch {
    return iso;
  }
}

const TONE_BADGE: Record<EmotionalTone, string> = {
  reflective: "bg-indigo/10 text-foreground border-indigo/30",
  encouraging: "bg-emerald/10 text-foreground border-emerald/30",
  anxious: "bg-amber-100 text-amber-900 border-amber-300",
  grateful: "bg-emerald/10 text-foreground border-emerald/30",
  uncertain: "bg-muted text-muted-foreground border-border",
  joyful: "bg-amber-100 text-amber-900 border-amber-300",
  grieving: "bg-violet/10 text-foreground border-violet/30",
  determined: "bg-foreground text-background border-foreground",
};

function MessageLine({ message }: { message: Message }) {
  return (
    <p className="text-sm leading-relaxed">
      <span className="text-xs text-muted-foreground tabular-nums">
        [{fmtTimestamp(message.timestamp, "MMM d HH:mm")}]
      </span>{" "}
      <span className="font-medium text-foreground">{message.sender}:</span>{" "}
      <span className="text-foreground/90">{message.content}</span>
    </p>
  );
}

// ---------------------------------------------------------------------------
// Tab content — Raw messages
// ---------------------------------------------------------------------------

function RawMessagesView({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return (
      <div className="glass glow-border rounded-xl p-8 text-center text-sm text-muted-foreground">
        No messages parsed yet.
      </div>
    );
  }

  return (
    <div className="glass glow-border rounded-xl">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium">
          {messages.length} parsed{" "}
          {messages.length === 1 ? "message" : "messages"}
        </p>
        <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          flat list
        </span>
      </div>
      <ol className="max-h-[28rem] space-y-2 overflow-y-auto px-4 py-4">
        {messages.map((message, index) => (
          <li
            key={`${message.timestamp}-${index}`}
            className="border-b border-border/40 pb-2 last:border-b-0 last:pb-0"
          >
            <MessageLine message={message} />
          </li>
        ))}
      </ol>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab content — Emotional chunks
// ---------------------------------------------------------------------------

function ChunkBoundaryAnnotation({ reason }: { reason: BoundaryReason }) {
  const meta = BOUNDARY_META[reason];
  const Icon = meta.icon;
  return (
    <div className="my-4 flex items-center gap-3" aria-label={`Boundary: ${meta.label}`}>
      <div className={cn("h-px flex-1", meta.ruleClassName)} />
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none shadow-sm",
          meta.pillClassName,
        )}
      >
        <Icon className="h-3 w-3" aria-hidden />
        <span>{meta.label}</span>
      </div>
      <div className={cn("h-px flex-1", meta.ruleClassName)} />
    </div>
  );
}

function ChunkCard({
  chunk,
  index,
  total,
}: {
  chunk: MemoryChunk;
  index: number;
  total: number;
}) {
  const tone = chunk.primary_tone;
  const toneCls = tone ? TONE_BADGE[tone] : "";
  const intensityPct = Math.round(
    Math.max(0, Math.min(1, chunk.intensity)) * 100,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.04 }}
    >
      <Card className="glass glow-border">
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Chunk {index + 1} of {total}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {fmtTimestamp(chunk.start_time)}
              <span className="px-1.5 text-muted-foreground/60">→</span>
              {fmtTimestamp(chunk.end_time)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {chunk.messages.length}{" "}
              {chunk.messages.length === 1 ? "message" : "messages"} ·{" "}
              {chunk.source}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {tone && (
              <Badge
                variant="outline"
                className={cn("capitalize", toneCls)}
                title={`Primary tone: ${tone}`}
              >
                {tone}
              </Badge>
            )}
            {tone && (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                intensity {intensityPct}%
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <ol className="space-y-1.5">
            {chunk.messages.map((message, msgIdx) => (
              <li key={`${chunk.chunk_id}-${msgIdx}`}>
                <MessageLine message={message} />
              </li>
            ))}
          </ol>

          {chunk.themes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {chunk.themes.map((theme) => (
                <Badge
                  key={theme}
                  variant="secondary"
                  className="capitalize text-[10px]"
                >
                  {theme}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EmotionalChunksView({ chunks }: { chunks: MemoryChunk[] }) {
  if (chunks.length === 0) {
    return (
      <div className="glass glow-border rounded-xl p-8 text-center text-sm text-muted-foreground">
        No chunks produced yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Layers className="h-4 w-4" />
          <span>
            {chunks.length} {chunks.length === 1 ? "chunk" : "chunks"}
          </span>
        </span>
        <span className="text-muted-foreground/60">·</span>
        <span>grouped by time and emotional continuity</span>
      </div>
      {chunks.map((chunk, index) => (
        <div key={chunk.chunk_id}>
          <ChunkCard chunk={chunk} index={index} total={chunks.length} />
          {index < chunks.length - 1 && (
            <ChunkBoundaryAnnotation reason={chunk.boundary_reason} />
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Boundary legend (shown under the chunk list)
// ---------------------------------------------------------------------------

function BoundaryLegend({
  presentReasons,
}: {
  presentReasons: Set<BoundaryReason>;
}) {
  const allReasons = Object.keys(BOUNDARY_META) as BoundaryReason[];

  return (
    <div className="mt-5 rounded-xl border border-border bg-card/40 p-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Boundary legend
      </p>
      <ul className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        {allReasons.map((reason) => {
          const meta = BOUNDARY_META[reason];
          const isUsed = presentReasons.has(reason);
          const Icon = meta.icon;
          return (
            <li
              key={reason}
              className={cn(
                "flex items-start gap-2.5 rounded-lg border px-3 py-2 transition",
                isUsed
                  ? "border-border bg-card"
                  : "border-border/40 bg-transparent opacity-60",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full",
                  meta.pillClassName,
                )}
              >
                <Icon className="h-3 w-3" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-foreground">
                    {meta.label}
                  </span>
                  {!isUsed && (
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      not in this run
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-muted-foreground">
                  {meta.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top-level component
// ---------------------------------------------------------------------------

export function BeforeAfterCompare({
  messages,
  chunks,
  defaultTab = "chunks",
  className,
}: BeforeAfterCompareProps) {
  const counts = useMemo(
    () => ({ messages: messages.length, chunks: chunks.length }),
    [messages.length, chunks.length],
  );

  // Which boundary reasons actually appear in this run? Used to gray out
  // unused entries in the legend.
  const presentReasons = useMemo(() => {
    const set = new Set<BoundaryReason>();
    chunks.forEach((c, idx) => {
      // Skip the very last chunk's boundary reason — it's always end_of_stream
      // and isn't surfaced as a between-chunks annotation.
      if (idx < chunks.length - 1) set.add(c.boundary_reason);
    });
    return set;
  }, [chunks]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("w-full", className)}
      aria-label="Before/after comparison: raw messages vs emotional chunks"
    >
      <Tabs defaultValue={defaultTab} className="w-full">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-base font-semibold tracking-tight">
              Raw input vs. emotional chunks
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Chunks are grouped by emotional continuity, not token count.
              Boundary reasons appear between chunks.
            </p>
          </div>
          <TabsList>
            <TabsTrigger value="raw" className="gap-1.5">
              <AlignJustify className="h-3.5 w-3.5" />
              Raw
              <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground tabular-nums">
                {counts.messages}
              </span>
            </TabsTrigger>
            <TabsTrigger value="chunks" className="gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Chunks
              <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground tabular-nums">
                {counts.chunks}
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Compact metric strip — rate of compression at a glance. */}
        {counts.messages > 0 && counts.chunks > 0 && (
          <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="tabular-nums font-medium text-foreground">
              {counts.messages}
            </span>
            <span>messages</span>
            <Minus className="h-3 w-3" aria-hidden />
            <span className="tabular-nums font-medium text-foreground">
              {counts.chunks}
            </span>
            <span>chunks</span>
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              ≈ {Math.max(1, Math.round(counts.messages / counts.chunks))} msgs / chunk
            </span>
          </div>
        )}

        <TabsContent value="raw" className="mt-4">
          <RawMessagesView messages={messages} />
        </TabsContent>

        <TabsContent value="chunks" className="mt-4">
          <EmotionalChunksView chunks={chunks} />
          {chunks.length > 1 && <BoundaryLegend presentReasons={presentReasons} />}
        </TabsContent>
      </Tabs>
    </motion.section>
  );
}

export default BeforeAfterCompare;
