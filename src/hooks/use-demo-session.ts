/**
 * React Query hooks for the demo session lifecycle.
 *
 * - `useInitializeDemo` — mutation that calls `POST /api/v1/demo/initialize`,
 *   persists the returned `session_id` to `sessionStorage`, and primes the
 *   `["demo-session"]` query cache so other components can read session
 *   metadata without re-fetching.
 * - `useDemoSession` — query (5-minute stale time) that hydrates UI from the
 *   cached `InitializeDemoResponse`. The backend has no "get current session"
 *   endpoint today, so the cache is the source of truth and the query resolves
 *   to `null` until `useInitializeDemo` succeeds.
 * - On `ApiError(code === "SESSION_NOT_FOUND")` from any consumer of this
 *   module, `sessionStorage` is cleared via `clearDemoSession` so the UI can
 *   surface a re-initialize prompt.
 *
 * Validates Requirements: 8.1, 8.2, 9.4, 11.4.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  ApiError,
  initializeDemo,
  SESSION_STORAGE_KEY,
  type InitializeDemoResponse,
} from "../services/api-client";

/** React Query key holding the active demo session metadata. */
export const DEMO_SESSION_QUERY_KEY = ["demo-session"] as const;

/** Five minutes, expressed in milliseconds. */
const FIVE_MINUTES_MS = 5 * 60 * 1000;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Remove the persisted `session_id` from `sessionStorage`. Safe to call in
 * SSR contexts and in private-mode browsers where `sessionStorage` access can
 * throw.
 */
function removeStoredSessionId(): void {
  if (typeof window === "undefined" || typeof sessionStorage === "undefined") {
    return;
  }
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Private-mode browsers can throw on write; nothing useful to do here.
  }
}

/**
 * Persist the demo `session_id` to `sessionStorage`. Silently no-ops in SSR
 * and in private-mode browsers where storage access throws.
 */
function writeStoredSessionId(sessionId: string): void {
  if (typeof window === "undefined" || typeof sessionStorage === "undefined") {
    return;
  }
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  } catch {
    // No-op: writing was best-effort.
  }
}

/**
 * Clear all demo-session state: the persisted `session_id`, and any cached
 * session metadata held by React Query. Used by the SESSION_NOT_FOUND error
 * path and exposed for explicit "restart demo" actions.
 *
 * Validates Requirement 11.4 (frontend reaction to expired/unknown sessions).
 */
export function clearDemoSession(qc?: QueryClient): void {
  removeStoredSessionId();
  if (qc) {
    qc.setQueryData<InitializeDemoResponse | null>(
      DEMO_SESSION_QUERY_KEY,
      null,
    );
  }
}

// ---------------------------------------------------------------------------
// Mutation: initialize a new demo session
// ---------------------------------------------------------------------------

/**
 * Mutation hook that creates a fresh demo session on the backend and
 * persists the resulting `session_id` so subsequent API calls auto-attach
 * the `X-Session-Id` header.
 *
 * - On success, writes `session_id` to `sessionStorage` and primes the
 *   `["demo-session"]` cache so `useDemoSession` reflects the new state
 *   without re-fetching.
 * - On `SESSION_NOT_FOUND`, clears any stale persisted session so the UI can
 *   prompt the user to re-initialize. This covers the rare case where the
 *   backend rejects the request because a header from a previous session is
 *   still attached.
 *
 * Validates Requirements: 8.1, 8.2, 11.4.
 */
export function useInitializeDemo(): UseMutationResult<
  InitializeDemoResponse,
  ApiError,
  void
> {
  const qc = useQueryClient();

  return useMutation<InitializeDemoResponse, ApiError, void>({
    mutationFn: () => initializeDemo(),
    onSuccess: (data) => {
      writeStoredSessionId(data.session_id);
      qc.setQueryData<InitializeDemoResponse>(DEMO_SESSION_QUERY_KEY, data);
    },
    onError: (err) => {
      if (err instanceof ApiError && err.code === "SESSION_NOT_FOUND") {
        clearDemoSession(qc);
      }
    },
    retry: 0,
  });
}

// ---------------------------------------------------------------------------
// Query: hydrate UI from cached session metadata
// ---------------------------------------------------------------------------

/**
 * Query hook that exposes the active demo session's metadata for UI
 * hydration (chunk count, sources, suggested questions, expiry).
 *
 * The backend does not currently expose a "get current session" endpoint;
 * the cache is populated by `useInitializeDemo` on success. This hook is
 * therefore a passive reader: `queryFn` resolves to the existing cached
 * value (or `null`) and the 5-minute `staleTime` matches the design table.
 *
 * Validates Requirements: 8.2, 9.4.
 */
export function useDemoSession(): UseQueryResult<
  InitializeDemoResponse | null,
  ApiError
> {
  const qc = useQueryClient();

  return useQuery<InitializeDemoResponse | null, ApiError>({
    queryKey: DEMO_SESSION_QUERY_KEY,
    queryFn: () => {
      // No remote fetch: the cache is the source of truth. Resolve to the
      // currently cached value, or `null` when the user has not yet
      // initialized a demo session.
      const cached = qc.getQueryData<InitializeDemoResponse | null>(
        DEMO_SESSION_QUERY_KEY,
      );
      return Promise.resolve(cached ?? null);
    },
    staleTime: FIVE_MINUTES_MS,
    retry: 0,
  });
}
