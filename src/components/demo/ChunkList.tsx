/**
 * `ChunkList` — scrollable list of `MemoryChunkCard`s.
 *
 * Layout choices:
 *  - The list is height-flexible: it grows to fill the parent column and
 *    only scrolls inside its own container, so the right rail of the demo
 *    page can use the full available height instead of being capped at a
 *    few rows.
 *  - Header strip shows a count and a small Layers icon for at-a-glance
 *    "what is this list" context.
 *  - Selected card expands inline; selection is owned by the parent.
 *  - Empty state mirrors the design system surface (glass + glow-border)
 *    and explains the next action ("upload" or "initialize") rather than
 *    looking like a blank pane.
 *
 * Validates Requirements: 4.5, 5.5, 6.5.
 */

import { AnimatePresence, motion } from "framer-motion";
import { Inbox, Layers } from "lucide-react";

import type { MemoryChunk } from "../../services/api-client";
import { MemoryChunkCard } from "./MemoryChunkCard";

export interface ChunkListProps {
  chunks: MemoryChunk[];
  /** `chunk_id` of the currently expanded card, or `null`/`undefined`. */
  selectedChunkId?: string | null;
  /** Click handler — invoked with the chunk that was activated. */
  onSelectChunk?: (chunkId: string) => void;
  /** Optional override for the outer container's class. */
  className?: string;
  /** Optional override for the empty-state copy. */
  emptyMessage?: string;
}

const DEFAULT_EMPTY_MESSAGE =
  "No memory chunks yet — initialize the demo or upload a file to begin.";

export function ChunkList({
  chunks,
  selectedChunkId,
  onSelectChunk,
  className,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
}: ChunkListProps) {
  const containerCls = [
    "glass glow-border flex flex-col rounded-xl",
    // Height-flexible: take the full parent column on lg+, fall back to a
    // generous min height on smaller widths.
    "min-h-[24rem] lg:min-h-[36rem] lg:h-full",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  if (chunks.length === 0) {
    return (
      <div className={containerCls}>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="h-4 w-4" aria-hidden />
          </span>
          <p className="max-w-xs text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div role="list" aria-label="Memory chunks" className={containerCls}>
      {/* Header strip with count. */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Layers className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span>
            {chunks.length} {chunks.length === 1 ? "chunk" : "chunks"}
          </span>
        </div>
        {selectedChunkId && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-accent">
            1 selected
          </span>
        )}
      </div>

      {/* Scrollable body — fills remaining vertical space. */}
      <div className="flex-1 overflow-y-auto p-3">
        <AnimatePresence initial={false}>
          <motion.ul layout className="flex flex-col gap-3">
            {chunks.map((chunk) => {
              const isSelected = chunk.chunk_id === selectedChunkId;
              return (
                <li key={chunk.chunk_id} role="listitem">
                  <MemoryChunkCard
                    chunk={chunk}
                    isSelected={isSelected}
                    onSelect={
                      onSelectChunk
                        ? () => onSelectChunk(chunk.chunk_id)
                        : undefined
                    }
                  />
                </li>
              );
            })}
          </motion.ul>
        </AnimatePresence>
      </div>
    </div>
  );
}
