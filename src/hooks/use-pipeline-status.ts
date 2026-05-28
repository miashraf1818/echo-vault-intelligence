/**
 * Derived pipeline UI state for the demo upload flow.
 *
 * The backend runs the full pipeline (parse → chunk → enrich → embed → store)
 * synchronously and returns per-stage timings as part of the upload response.
 * That makes "real" streaming progress unnecessary, but a single "loading
 * spinner" loses the educational value of showing each stage. This hook
 * bridges the gap:
 *
 *   - while the upload is in flight, stages animate forward in order using a
 *     fixed dwell time so the visualizer feels alive even on a fast backend
 *   - once the response arrives, the hook re-paces the animation against the
 *     real per-stage timings the backend reports (`pipeline.parse_ms` etc.)
 *     so users can read off "enrichment took 2.3 s" at the end
 *   - if the mutation errors out, every stage that hadn't completed is
 *     marked `error`
 *
 * Validates Requirements: 5.5, 9.5, 10.1.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { PipelineTimings, UploadResponse } from "../services/api-client";

export const PIPELINE_STAGES = [
  "parse",
  "chunk",
  "enrich",
  "embed",
  "store",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export type StageState = "pending" | "active" | "complete" | "error";

/**
 * Minimal mutation-shape contract this hook needs. Defined structurally so
 * tests can pass plain objects without depending on React Query.
 */
export interface UploadMutationLike {
  isIdle: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  data?: UploadResponse | undefined;
}

export interface PipelineStatus {
  /** Per-stage state, ordered by `PIPELINE_STAGES`. */
  stages: Record<PipelineStage, StageState>;
  /** The currently active stage, or `null` if idle/complete/errored. */
  activeStage: PipelineStage | null;
  /** True while the upload mutation is in flight. */
  isUploading: boolean;
  /** True once every stage has reached `complete`. */
  isComplete: boolean;
  /** True if the mutation errored or any stage is in `error`. */
  isError: boolean;
  /** Real per-stage timings from the backend, once the response arrives. */
  timings: PipelineTimings | null;
}

/**
 * Estimated dwell time per stage while the upload is still in flight, in ms.
 * These are loose visual placeholders only — they get overwritten by the real
 * backend timings as soon as the mutation resolves.
 */
const PENDING_DWELL_MS: Record<PipelineStage, number> = {
  parse: 400,
  chunk: 600,
  enrich: 1500,
  embed: 1200,
  store: 400,
};

const TIMING_KEYS: Record<PipelineStage, keyof PipelineTimings> = {
  parse: "parse_ms",
  chunk: "chunk_ms",
  enrich: "enrich_ms",
  embed: "embed_ms",
  store: "store_ms",
};

const idleStages = (): Record<PipelineStage, StageState> => ({
  parse: "pending",
  chunk: "pending",
  enrich: "pending",
  embed: "pending",
  store: "pending",
});

const completeStages = (): Record<PipelineStage, StageState> => ({
  parse: "complete",
  chunk: "complete",
  enrich: "complete",
  embed: "complete",
  store: "complete",
});

/**
 * Build a paced animation timeline. Each step advances the named stage to
 * `active` or `complete` after `delayMs` from the start of the run.
 */
function buildTimeline(
  durations: Record<PipelineStage, number>,
): Array<{ at: number; stage: PipelineStage; state: StageState }> {
  const timeline: Array<{ at: number; stage: PipelineStage; state: StageState }> = [];
  let cursor = 0;
  for (const stage of PIPELINE_STAGES) {
    timeline.push({ at: cursor, stage, state: "active" });
    cursor += Math.max(80, durations[stage]);
    timeline.push({ at: cursor, stage, state: "complete" });
  }
  return timeline;
}

export function usePipelineStatus(
  mutation: UploadMutationLike,
): PipelineStatus {
  const [stages, setStages] = useState<Record<PipelineStage, StageState>>(
    idleStages,
  );

  // Keep the latest mutation snapshot accessible to async timers without
  // re-triggering effects on every render.
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const clearTimers = () => {
    for (const t of timersRef.current) {
      clearTimeout(t);
    }
    timersRef.current = [];
  };

  // Drive the animation while pending.
  useEffect(() => {
    if (!mutation.isPending) return;
    clearTimers();
    setStages(idleStages());

    const timeline = buildTimeline(PENDING_DWELL_MS);
    for (const step of timeline) {
      const handle = setTimeout(() => {
        setStages((prev) => ({ ...prev, [step.stage]: step.state }));
      }, step.at);
      timersRef.current.push(handle);
    }

    return clearTimers;
  }, [mutation.isPending]);

  // Once the mutation resolves successfully, snap to the real timings.
  useEffect(() => {
    if (!mutation.isSuccess || !mutation.data) return;
    clearTimers();

    const pipeline = mutation.data.pipeline;
    // Map each stage to its real backend timing. Floor at a small minimum so
    // very fast stages still animate visibly.
    const realDurations = PIPELINE_STAGES.reduce(
      (acc, stage) => {
        const ms = pipeline[TIMING_KEYS[stage]] ?? 0;
        acc[stage] = Math.min(1500, Math.max(120, Math.round(ms)));
        return acc;
      },
      {} as Record<PipelineStage, number>,
    );

    setStages(idleStages());
    const timeline = buildTimeline(realDurations);
    for (const step of timeline) {
      const handle = setTimeout(() => {
        setStages((prev) => ({ ...prev, [step.stage]: step.state }));
      }, step.at);
      timersRef.current.push(handle);
    }
    // Belt-and-braces: ensure final state is fully complete even if a timer
    // is dropped (e.g. unmount race).
    const finalAt = timeline.reduce((max, s) => Math.max(max, s.at), 0) + 50;
    const finalHandle = setTimeout(() => setStages(completeStages()), finalAt);
    timersRef.current.push(finalHandle);

    return clearTimers;
  }, [mutation.isSuccess, mutation.data]);

  // On error, mark whatever stage was active (or the first pending) as errored
  // and leave already-completed stages alone.
  useEffect(() => {
    if (!mutation.isError) return;
    clearTimers();
    setStages((prev) => {
      const next = { ...prev };
      let marked = false;
      for (const stage of PIPELINE_STAGES) {
        if (!marked && next[stage] !== "complete") {
          next[stage] = "error";
          marked = true;
        }
      }
      // If everything had completed, attribute the error to the last stage.
      if (!marked) next.store = "error";
      return next;
    });
  }, [mutation.isError]);

  // Reset to idle when the mutation goes back to idle (e.g. after a retry).
  useEffect(() => {
    if (mutation.isIdle && !mutation.data) {
      clearTimers();
      setStages(idleStages());
    }
  }, [mutation.isIdle, mutation.data]);

  // Cleanup on unmount.
  useEffect(() => clearTimers, []);

  return useMemo<PipelineStatus>(() => {
    const isError =
      mutation.isError ||
      PIPELINE_STAGES.some((stage) => stages[stage] === "error");
    const isComplete =
      !isError && PIPELINE_STAGES.every((stage) => stages[stage] === "complete");
    const activeStage =
      PIPELINE_STAGES.find((stage) => stages[stage] === "active") ?? null;

    return {
      stages,
      activeStage,
      isUploading: mutation.isPending,
      isComplete,
      isError,
      timings: mutation.data?.pipeline ?? null,
    };
  }, [stages, mutation.isPending, mutation.isError, mutation.data]);
}
