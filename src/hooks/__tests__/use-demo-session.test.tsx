/**
 * Tests for `useInitializeDemo` SESSION_NOT_FOUND handling.
 *
 * Validates Requirement 11.4: when the backend rejects an `initializeDemo`
 * call with `ApiError(code === "SESSION_NOT_FOUND")`, the hook MUST clear the
 * stale `session_id` from `sessionStorage` so the UI can prompt the user to
 * re-initialize from a clean slate.
 *
 * The api-client is mocked so no real network call is made — `initializeDemo`
 * rejects synchronously with a real `ApiError` instance (preserved via
 * `vi.importActual`) and the test asserts the post-error storage state.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

// Mock the api-client BEFORE importing the hook so the mutation closes over
// the mocked `initializeDemo`. Preserve the real `ApiError` class and the
// `SESSION_STORAGE_KEY` constant so the hook's instanceof check still works.
vi.mock("../../services/api-client", async () => {
  const actual =
    await vi.importActual<typeof import("../../services/api-client")>(
      "../../services/api-client",
    );
  return {
    ...actual,
    initializeDemo: vi.fn(),
  };
});

import {
  ApiError,
  SESSION_STORAGE_KEY,
  initializeDemo,
} from "../../services/api-client";
import { useInitializeDemo } from "../use-demo-session";

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: {
      mutations: { retry: 0 },
      queries: { retry: 0 },
    },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("useInitializeDemo SESSION_NOT_FOUND handling", () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem(SESSION_STORAGE_KEY, "stale-uuid");
    vi.mocked(initializeDemo).mockReset();
  });

  it("clears sessionStorage when the mutation rejects with SESSION_NOT_FOUND", async () => {
    vi.mocked(initializeDemo).mockRejectedValue(
      new ApiError("SESSION_NOT_FOUND", "Session not found", 404),
    );

    const { result } = renderHook(() => useInitializeDemo(), { wrapper });

    // Sanity: pre-seed is in place before the mutation runs.
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBe("stale-uuid");

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });
});
