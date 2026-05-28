/**
 * `/demo` route — guided three-step live demo of the EchoVault pipeline.
 *
 * Composes the demo components into a single page that walks a visitor
 * through the experience:
 *
 *   1. Initialize       — `DemoHero` + `UploadZone`. The user either spins up a
 *                         pre-seeded sample session or uploads their own file.
 *   2. Explore Memories — `PipelineStages` + `BeforeAfterCompare` + `ChunkList`.
 *                         Surfaces the chunks produced by the pipeline (or by
 *                         the seeded demo session).
 *   3. Reflect          — `ReflectionChat`. Grounded conversation with the
 *                         memories, with citation badges and an "Analytical
 *                         Companion Mode" indicator.
 *
 * On mount, the route pings `GET /api/v1/health`. If the backend is
 * unreachable it renders the full-page `ErrorState` instead of the demo
 * surface, satisfying Requirement 9.4 (no crashy UI when the backend is down).
 *
 * Validates Requirements: 9.1, 9.2, 9.4, 9.6, 9.7.
 */

import { createFileRoute } from "@tanstack/react-router";
import {
  useMutationState,
  useQuery,
  type MutationState,
} from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useMemo, useRef } from "react";

import { PageBackdrop, SiteFooter, SiteNav } from "@/components/site-shell";

import { BeforeAfterCompare } from "../components/demo/BeforeAfterCompare";
import { ChunkList } from "../components/demo/ChunkList";
import { DemoHero } from "../components/demo/DemoHero";
import { ErrorState } from "../components/demo/ErrorState";
import { PipelineStages } from "../components/demo/PipelineStages";
import { ReflectionChat } from "../components/demo/ReflectionChat";
import { UploadZone } from "../components/demo/UploadZone";

import {
  useDemoSession,
  useInitializeDemo,
} from "../hooks/use-demo-session";
import { UPLOAD_MEMORIES_MUTATION_KEY } from "../hooks/use-memory-mutations";
import {
  usePipelineStatus,
  type UploadMutationLike,
} from "../hooks/use-pipeline-status";
import {
  ApiError,
  getHealth,
  type HealthResponse,
  type Message,
  type UploadResponse,
} from "../services/api-client";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Live demo — EchoVault AI" },
      {
        name: "description",
        content:
          "Watch the EchoVault Temporal Emotional RAG pipeline run end-to-end: parse a memory archive, chunk by emotional continuity, embed it, and reflect through a grounded, cited conversation.",
      },
    ],
  }),
  component: DemoPage,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Aggregate every parsed `Message` out of the chunk list. The backend only
 * returns the raw parsed list as part of `parsed.message_count`/`date_range`,
 * so for the "Raw messages" tab of `BeforeAfterCompare` we reconstruct the
 * sequence by flattening each chunk's messages in order.
 */
function flattenMessages(chunks: UploadResponse["chunks"]): Message[] {
  const out: Message[] = [];
  for (const chunk of chunks) {
    for (const message of chunk.messages) out.push(message);
  }
  return out;
}

/**
 * Adapt a React Query `MutationState<UploadResponse, ApiError, File>` into the
 * structural shape that `usePipelineStatus` expects.
 *
 * `useMutationState` returns the underlying state object rather than the
 * convenience flags exposed on a `UseMutationResult`, so we derive them here.
 * If no upload has been started yet we return an "idle" snapshot so the
 * pipeline visualizer renders all stages as pending without animating.
 */
function adaptMutationState(
  state: MutationState<UploadResponse, ApiError, File> | undefined,
): UploadMutationLike {
  if (!state) {
    return {
      isIdle: true,
      isPending: false,
      isSuccess: false,
      isError: false,
      data: undefined,
    };
  }
  return {
    isIdle: state.status === "idle",
    isPending: state.status === "pending",
    isSuccess: state.status === "success",
    isError: state.status === "error",
    data: state.data ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Step heading — used to label the three guided steps.
// ---------------------------------------------------------------------------

interface StepHeadingProps {
  index: 1 | 2 | 3;
  label: string;
  description: string;
  state?: "active" | "complete" | "pending";
}

function StepHeading({
  index,
  label,
  description,
  state = "active",
}: StepHeadingProps) {
  const numberCls =
    state === "complete"
      ? "bg-foreground text-background"
      : state === "active"
        ? "bg-foreground text-background ring-4 ring-accent/15"
        : "bg-muted text-muted-foreground border border-border";

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold tabular-nums transition ${numberCls}`}
        >
          {index}
        </span>
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-accent">
            Step {index}
          </span>
          <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {label}
          </h2>
        </div>
      </div>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

/**
 * Visual divider between major page sections. Slightly more present than a
 * default `<hr>` so the three-step rhythm reads even on a long scroll.
 */
function SectionDivider() {
  return (
    <div
      aria-hidden
      className="mx-auto flex w-full max-w-3xl items-center gap-4"
    >
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-border" />
      <span className="h-1 w-1 rounded-full bg-border" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-border" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

function DemoPage() {
  // Ping the health endpoint on mount. We rely on the global query default
  // (`retry: 1`) configured in `src/router.tsx`, so a single transient blip
  // gets a free retry before we decide the backend is down.
  const health = useQuery<HealthResponse, ApiError>({
    queryKey: ["health"],
    queryFn: getHealth,
    staleTime: 30_000,
  });

  // Subscribe to the upload mutation state so the route can drive the
  // pipeline visualizer / before-after / chunk list — even though `UploadZone`
  // is the call site. Filtering by mutationKey keeps unrelated mutations out.
  const uploadStates = useMutationState<
    MutationState<UploadResponse, ApiError, File>
  >({
    filters: { mutationKey: UPLOAD_MEMORIES_MUTATION_KEY },
  });
  const latestUpload = uploadStates.length
    ? uploadStates[uploadStates.length - 1]
    : undefined;
  const uploadStatus = adaptMutationState(latestUpload);
  const pipelineStatus = usePipelineStatus(uploadStatus);

  // Demo session bootstrap. `useInitializeDemo` is fired by the "Try with
  // sample data" CTA; `useDemoSession` is the cached read-side that hydrates
  // the suggested-questions strip and the chat surface.
  const initializeDemo = useInitializeDemo();
  const demoSession = useDemoSession();

  // Anchor for "Upload your own" so the secondary CTA can scroll the user
  // down to the dropzone instead of being a no-op.
  const uploadZoneRef = useRef<HTMLDivElement>(null);

  const onTrySample = () => {
    if (initializeDemo.isPending) return;
    initializeDemo.mutate();
  };

  const onUploadOwn = () => {
    uploadZoneRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Did the user actually start interacting with the upload pipeline?
  const hasUploadActivity =
    uploadStatus.isPending || uploadStatus.isSuccess || uploadStatus.isError;
  const uploadResponse: UploadResponse | undefined = uploadStatus.data;

  // Demo session presence (sample-data path). The cached response carries
  // the cloned chunks so we can drive Step 2 from the seeded path too.
  const hasDemoSession = Boolean(demoSession.data);

  // Unified chunk source for Step 2. Upload wins when it has resolved,
  // otherwise we fall back to the seed-clone returned by /demo/initialize.
  const exploreChunks = useMemo(() => {
    if (uploadStatus.isSuccess && uploadResponse) return uploadResponse.chunks;
    if (hasDemoSession) return demoSession.data?.chunks ?? [];
    return [];
  }, [uploadStatus.isSuccess, uploadResponse, hasDemoSession, demoSession.data]);

  // Memoize the flattened message list (only meaningful for the upload
  // path, since seeded chunks are pre-grouped — we still flatten for a
  // consistent "raw messages" view).
  const rawMessages = useMemo<Message[]>(
    () => flattenMessages(exploreChunks),
    [exploreChunks],
  );

  // Step 2 (Explore) is meaningful any time we have chunks to show OR an
  // upload is mid-flight (so the pipeline visualizer can run live).
  const showExplore = hasUploadActivity || exploreChunks.length > 0;

  // Step 3 (Reflect) opens once a session exists either way.
  const showReflect = hasDemoSession || uploadStatus.isSuccess;

  // Backend-unreachable error path takes over the page.
  if (health.isError) {
    return (
      <div className="relative min-h-screen bg-background text-foreground">
        <PageBackdrop />
        <SiteNav />
        <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col px-4 pt-28 pb-16 sm:px-6 md:pt-32">
          <ErrorState
            onRetry={() => {
              void health.refetch();
            }}
            isRetrying={health.isFetching}
            message={
              health.error?.message
                ? `${health.error.message} (${health.error.code})`
                : undefined
            }
          />
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <PageBackdrop />
      <SiteNav />

      <main className="mx-auto flex w-full max-w-5xl flex-col px-4 pt-28 pb-20 sm:px-6 md:pt-32">
        {/* ---------------------------------------------------------------
         * Step 1 — Initialize
         * --------------------------------------------------------------- */}
        <section
          aria-label="Step 1: Initialize"
          className="flex flex-col gap-10"
        >
          <DemoHero
            onTrySample={onTrySample}
            onUploadOwn={onUploadOwn}
            isSampleLoading={initializeDemo.isPending}
            isUploadDisabled={uploadStatus.isPending}
          />

          {initializeDemo.isError && (
            <div
              role="alert"
              className="mx-auto max-w-xl rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-xs text-destructive"
            >
              <span className="font-medium">
                {initializeDemo.error?.code ?? "ERROR"}
              </span>
              <span className="mx-2 text-border">·</span>
              {initializeDemo.error?.message ??
                "Couldn't initialize the demo session."}
            </div>
          )}

          <div ref={uploadZoneRef} className="flex flex-col gap-4">
            <StepHeading
              index={1}
              label="Initialize"
              description="Spin up a pre-seeded sample session for an instant tour, or drop your own WhatsApp .txt export to run the full pipeline."
              state={
                hasUploadActivity || hasDemoSession ? "complete" : "active"
              }
            />
            <UploadZone />
          </div>
        </section>

        {/* ---------------------------------------------------------------
         * Step 2 — Explore Memories
         * Shown for both paths: live pipeline run when an upload is in
         * flight, or the seeded chunk set when "Try with sample data" was
         * used.
         * --------------------------------------------------------------- */}
        {showExplore && (
          <>
            <div className="my-16 md:my-20">
              <SectionDivider />
            </div>
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              aria-label="Step 2: Explore Memories"
              className="flex flex-col gap-6"
            >
              <StepHeading
                index={2}
                label="Explore Memories"
                description={
                  hasUploadActivity
                    ? "Watch each pipeline stage run, then compare the raw messages with the emotional chunks the system produced."
                    : "These chunks were produced by the same pipeline on a synthetic sample dataset — explore the boundaries the system chose, then ask the chat about them."
                }
                state={
                  exploreChunks.length > 0 || uploadStatus.isSuccess
                    ? "complete"
                    : "active"
                }
              />

              {/* Pipeline visualizer — only meaningful when an upload is
                  actually running through the pipeline. The seeded path
                  skips this since it was pre-baked at `make seed` time. */}
              {hasUploadActivity && (
                <div className="glass glow-border rounded-2xl p-4 sm:p-6">
                  <PipelineStages status={pipelineStatus} />
                </div>
              )}

              {exploreChunks.length > 0 && (
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-stretch">
                  <BeforeAfterCompare
                    messages={rawMessages}
                    chunks={exploreChunks}
                  />
                  <div className="flex flex-col gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      Memory chunks
                    </p>
                    <ChunkList chunks={exploreChunks} className="flex-1" />
                  </div>
                </div>
              )}
            </motion.section>
          </>
        )}

        {/* ---------------------------------------------------------------
         * Step 3 — Reflect
         * Available once the user has an active session (sample or upload).
         * --------------------------------------------------------------- */}
        {showReflect && (
          <>
            <div className="my-16 md:my-20">
              <SectionDivider />
            </div>
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              aria-label="Step 3: Reflect"
              className="flex flex-col gap-6"
            >
              <StepHeading
                index={3}
                label="Reflect"
                description="Ask the analytical companion about themes, periods, or patterns. Every claim is grounded in a real chunk and cited inline."
                state="active"
              />
              <ReflectionChat
                suggestedQuestions={demoSession.data?.suggested_questions}
              />
            </motion.section>
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
