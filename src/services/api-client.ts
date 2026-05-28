/**
 * Typed `fetch` wrapper for the EchoVault demo backend.
 *
 * - Reads `import.meta.env.VITE_BACKEND_URL` (default: http://localhost:8000).
 * - Auto-attaches the `X-Session-Id` header from `sessionStorage` when present.
 * - Parses the `{ status, data, error }` envelope and throws a typed
 *   `ApiError(code, message, status)` on non-ok responses.
 * - Exposes one function per backend endpoint:
 *   `initializeDemo`, `uploadMemories`, `searchMemories`, `reflect`, `getHealth`.
 *
 * Validates Requirements: 1.3, 9.3, 9.4.
 */

import type { components } from "./api-types";

// ---------------------------------------------------------------------------
// Re-exports from the generated OpenAPI types
// ---------------------------------------------------------------------------

export type EmotionalTone = components["schemas"]["EmotionalTone"];
export type ThematicTag = components["schemas"]["ThematicTag"];
export type SearchFilters = components["schemas"]["SearchFilters"];
export type SearchRequest = components["schemas"]["SearchRequest"];
export type ReflectRequest = components["schemas"]["ReflectRequest"];
export type ReflectionAnswerEntry = components["schemas"]["ReflectionAnswerEntry"];

/**
 * Hand-written `HealthResponse` shape.
 *
 * The backend wraps every endpoint body (including `/health`) in the
 * standard `{ status, data, error }` envelope, so the generated OpenAPI
 * schema for this route resolves to a plain `dict` instead of the
 * inner Pydantic model. We mirror the inner shape here so the typed
 * client still gets full intellisense.
 */
export interface HealthResponse {
  status: "ok" | "degraded";
  dependencies: {
    qdrant: "ok" | "down";
    groq: "ok" | "down";
    embedder: "ok" | "down";
  };
}

// ---------------------------------------------------------------------------
// Local response shapes — mirror the backend Pydantic models
// (the OpenAPI generator types these endpoints as opaque `dict` envelopes,
// so we mirror the design contracts here as a convenience layer)
// ---------------------------------------------------------------------------

export type BoundaryReason =
  | "time_gap"
  | "emotional_shift"
  | "size_limit"
  | "end_of_stream";

export interface Message {
  sender: string;
  timestamp: string; // ISO-8601
  content: string;
}

export interface MemoryChunk {
  chunk_id: string; // UUID
  session_id: string; // UUID
  source: string;
  text: string;
  messages: Message[];
  start_time: string; // ISO-8601
  end_time: string; // ISO-8601
  boundary_reason: BoundaryReason;
  primary_tone: EmotionalTone | null;
  intensity: number;
  themes: ThematicTag[];
}

export interface Citation {
  chunk_id: string;
  source: string;
  date: string; // ISO-8601
  confidence: number;
  excerpt: string;
}

export interface ReflectionAnswer {
  answer: string;
  citations: Citation[];
  rejected_claims: string[];
  /** Always "analytical_companion" today; surfaced for the frontend banner. */
  mode?: "analytical_companion";
}

export interface InitializeDemoResponse {
  session_id: string;
  expires_at: string; // ISO-8601
  chunk_count: number;
  sources: string[];
  suggested_questions: string[];
  /**
   * Cloned, fully-enriched chunks bound to the new session. The backend
   * surfaces them inline so the frontend can render the explore + before/
   * after views without a follow-up search call.
   */
  chunks: MemoryChunk[];
}

export interface UploadParsedSummary {
  message_count: number;
  date_range: [string, string]; // [earliest ISO, latest ISO]
  participants: string[];
}

export interface PipelineTimings {
  parse_ms: number;
  chunk_ms: number;
  enrich_ms: number;
  embed_ms: number;
  store_ms: number;
}

export interface UploadResponse {
  parsed: UploadParsedSummary;
  chunks: MemoryChunk[];
  pipeline: PipelineTimings;
}

export interface SearchResultItem {
  chunk: MemoryChunk;
  score: number;
}

export interface SearchResponse {
  results: SearchResultItem[];
}

// ---------------------------------------------------------------------------
// Envelope + error type
// ---------------------------------------------------------------------------

interface ApiEnvelopeOk<T> {
  status: "ok";
  data: T;
  error: null;
}

interface ApiEnvelopeErr {
  status: "error";
  data: null;
  error: { code: string; message: string };
}

type ApiEnvelope<T> = ApiEnvelopeOk<T> | ApiEnvelopeErr;

/**
 * Typed error thrown by the API client when the backend returns an error
 * envelope or the response cannot be parsed.
 *
 * The `code` mirrors the backend error catalog
 * (e.g. `MISSING_SESSION`, `SESSION_NOT_FOUND`, `FILE_TOO_LARGE`,
 * `INVALID_FILE_FORMAT`, `RATE_LIMITED`, `UPSTREAM_LLM_ERROR`,
 * `DEPENDENCY_DOWN`, `INTERNAL_ERROR`).
 */
export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

// ---------------------------------------------------------------------------
// Internal core: the typed fetch wrapper
// ---------------------------------------------------------------------------

/** Where the demo backend lives. Override per environment via Vite. */
const BASE_URL: string =
  (import.meta.env?.VITE_BACKEND_URL as string | undefined) ??
  "http://localhost:8000";

/** sessionStorage key used to persist the demo `session_id`. */
export const SESSION_STORAGE_KEY = "evd:session_id";

function readSessionId(): string | null {
  if (typeof window === "undefined" || typeof sessionStorage === "undefined") {
    return null;
  }
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    // Private-mode browsers can throw on access; treat as absent.
    return null;
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  // Only set JSON content-type when the body is a JSON string. Browsers must
  // own the multipart boundary header for FormData uploads.
  const body = init.body;
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  if (
    !isFormData &&
    typeof body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const sessionId = readSessionId();
  if (sessionId && !headers.has("X-Session-Id")) {
    headers.set("X-Session-Id", sessionId);
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch (err) {
    // Network error / CORS preflight failure / backend unreachable.
    const message = err instanceof Error ? err.message : "Network request failed";
    throw new ApiError("DEPENDENCY_DOWN", message, 0);
  }

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // Non-JSON body (e.g. proxy 502 HTML page). Fall through to error path.
  }

  if (!payload || typeof payload !== "object" || !("status" in payload)) {
    throw new ApiError(
      "INTERNAL_ERROR",
      `Malformed response from backend (HTTP ${res.status})`,
      res.status,
    );
  }

  if (payload.status === "error") {
    const code = payload.error?.code ?? "INTERNAL_ERROR";
    const message = payload.error?.message ?? `Request failed (${res.status})`;
    throw new ApiError(code, message, res.status);
  }

  if (!res.ok) {
    // Defensive: backend returned "ok" envelope but a non-2xx status. Treat as error.
    throw new ApiError(
      "INTERNAL_ERROR",
      `Unexpected HTTP ${res.status} on success envelope`,
      res.status,
    );
  }

  return payload.data;
}

// ---------------------------------------------------------------------------
// Public endpoint functions
// ---------------------------------------------------------------------------

/** `GET /api/v1/health` — liveness + per-dependency probe. */
export async function getHealth(): Promise<HealthResponse> {
  return call<HealthResponse>("/api/v1/health", { method: "GET" });
}

/** `POST /api/v1/demo/initialize` — create a fresh demo session. */
export async function initializeDemo(): Promise<InitializeDemoResponse> {
  return call<InitializeDemoResponse>("/api/v1/demo/initialize", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

/** `POST /api/v1/memories/upload` — multipart upload of a WhatsApp `.txt`. */
export async function uploadMemories(file: File): Promise<UploadResponse> {
  const fd = new FormData();
  fd.append("file", file);
  return call<UploadResponse>("/api/v1/memories/upload", {
    method: "POST",
    body: fd,
  });
}

/** `POST /api/v1/memories/search` — vector + filter search over the session. */
export async function searchMemories(
  request: SearchRequest,
): Promise<SearchResponse> {
  return call<SearchResponse>("/api/v1/memories/search", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/** `POST /api/v1/chat/reflect` — grounded reflection answer. */
export async function reflect(request: ReflectRequest): Promise<ReflectionAnswer> {
  return call<ReflectionAnswer>("/api/v1/chat/reflect", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
