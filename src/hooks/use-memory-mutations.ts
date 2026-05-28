/**
 * React Query mutations for the demo memory pipeline.
 *
 *   - `useUploadMemories` runs the full backend pipeline on a `.txt` file and,
 *     on success, invalidates the `["session"]` query family so any cached
 *     session-derived data (sources list, chunk count, suggested questions)
 *     is refetched.
 *   - `useSearchMemories` is user-driven, no caching, no retry.
 *   - `useReflect` posts a chat message and returns the grounded answer.
 *
 * All three mutations rely on the global React Query default `retry: 0` for
 * mutations (configured in `src/router.tsx`), but pin `retry: 0` locally as
 * documentation against accidental changes upstream.
 *
 * Validates Requirements: 5.5, 9.5, 10.1.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  reflect,
  searchMemories,
  uploadMemories,
} from "../services/api-client";
import type {
  ApiError,
  ReflectRequest,
  ReflectionAnswer,
  SearchRequest,
  SearchResponse,
  UploadResponse,
} from "../services/api-client";

/**
 * Stable mutation key for upload-memories invocations. Exported so the demo
 * route can observe the same mutation via `useMutationState` while the
 * `UploadZone` component owns the call site.
 */
export const UPLOAD_MEMORIES_MUTATION_KEY = ["upload-memories"] as const;

/**
 * Upload a WhatsApp `.txt` export through the full pipeline.
 *
 * On success this invalidates both `["session"]` (the canonical key per the
 * design) and `["demo-session"]` (the key used by `useDemoSession`) so any
 * downstream UI that displays session metadata refetches.
 */
export function useUploadMemories() {
  const queryClient = useQueryClient();
  return useMutation<UploadResponse, ApiError, File>({
    mutationKey: UPLOAD_MEMORIES_MUTATION_KEY,
    mutationFn: (file: File) => uploadMemories(file),
    retry: 0,
    onSuccess: () => {
      // The design names this query family `['session']`. We invalidate both
      // it and the more specific `['demo-session']` key actually used by
      // `useDemoSession` to be safe.
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: ["demo-session"] });
    },
  });
}

/** Hybrid vector + filter search over the current session's memories. */
export function useSearchMemories() {
  return useMutation<SearchResponse, ApiError, SearchRequest>({
    mutationFn: (request: SearchRequest) => searchMemories(request),
    retry: 0,
  });
}

/** Grounded reflection answer with citations. */
export function useReflect() {
  return useMutation<ReflectionAnswer, ApiError, ReflectRequest>({
    mutationFn: (request: ReflectRequest) => reflect(request),
    retry: 0,
  });
}
