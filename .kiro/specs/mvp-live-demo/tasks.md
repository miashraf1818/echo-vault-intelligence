# Implementation Plan: MVP Live Demo

## Overview

Two work streams build in parallel after the API contract is locked:

- **Backend** lives in a NEW sibling directory `~/Demo for EchoVaultAI/echovault-backend-demo/` (FastAPI / Python 3.11+).
- **Frontend** modifications happen in the EXISTING repo `~/Demo for EchoVaultAI/echo-vault-intelligence/` (TanStack Start, React 19).

Convert the feature design into a series of prompts for a code-generation LLM that will implement each step with incremental progress. Make sure that each prompt builds on the previous prompts, and ends with wiring things together. There should be no hanging or orphaned code that isn't integrated into a previous step. Focus ONLY on tasks that involve writing, modifying, or testing code.

The order is: scaffold the backend skeleton and lock the request/response shapes (Tasks 1–2), build the synthetic seed pipeline early (Task 5) so the frontend can integrate before the user-upload flow is finalized, fan out backend services and frontend client work in parallel (Tasks 3–4 and 8–9), then converge on integration tests, route wiring, and the smoke checklist (Tasks 10–13).

All paths below are **absolute** to remove ambiguity between the two repos.

## Tasks

- [x] 1. Scaffold backend project (`echovault-backend-demo/`)
  - [x] 1.1 Create `pyproject.toml`, project layout, and base FastAPI app
    - Initialize `~/Demo for EchoVaultAI/echovault-backend-demo/` with `pyproject.toml` (Python 3.11+, deps: fastapi, uvicorn, pydantic, pydantic-settings, sqlmodel, qdrant-client, sentence-transformers, groq, python-multipart, hypothesis, pytest, pytest-asyncio, httpx)
    - Create directory tree per design: `app/{api/v1,domain,services,infrastructure,data/seed}`, `tests/{unit,integration}`, `scripts/`
    - Create `app/main.py` with FastAPI instance, CORS middleware reading `FRONTEND_ORIGIN`, and v1 router registration stubs
    - Create `app/config.py` with Pydantic `Settings` loading `GROQ_API_KEY`, `GROQ_MODEL`, `QDRANT_PATH`, `EMBED_MODEL`, `FRONTEND_ORIGIN`, `SESSION_TTL_HOURS`, `MAX_UPLOAD_MB`
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 Implement standard error envelope and exception handler
    - Create `app/errors.py` with `ApiError` exception class and the error code catalog from the design (`MISSING_SESSION`, `SESSION_NOT_FOUND`, `FILE_TOO_LARGE`, `INVALID_FILE_FORMAT`, `RATE_LIMITED`, `UPSTREAM_LLM_ERROR`, `DEPENDENCY_DOWN`, `INTERNAL_ERROR`)
    - Register a FastAPI `exception_handler` that converts `ApiError` and uncaught exceptions into the `{ status, data, error: { code, message } }` envelope
    - Ensure a successful path helper that wraps responses in `{ status: "ok", data: ..., error: null }`
    - _Requirements: 1.3, 1.4_

  - [x] 1.3 Implement health endpoint
    - Create `app/api/v1/health.py` with `GET /api/v1/health` returning `{ status, dependencies: { qdrant, groq, embedder } }`
    - Stub each dependency probe so it returns "ok" or "down" without crashing when the dependency is unconfigured
    - Wire the router into `app/main.py`
    - _Requirements: 1.5_

  - [x] 1.4 Create `.env.example`, `Makefile`, and README
    - `.env.example` mirrors the design's env block (GROQ_API_KEY, GROQ_MODEL, QDRANT_PATH, EMBED_MODEL, FRONTEND_ORIGIN, SESSION_TTL_HOURS, MAX_UPLOAD_MB)
    - `Makefile` targets: `dev` (uvicorn reload), `seed` (calls `scripts/seed_demo.py`), `docker` (compose up), `test` (pytest)
    - `README.md` with two-terminal local run instructions (backend on :8000, frontend on :8080)
    - _Requirements: 1.1, 1.2_

- [x] 2. Define backend domain models and schemas
  - [x] 2.1 Implement `app/domain/enums.py` and `app/domain/models.py`
    - Port the Pydantic models from the design verbatim: `EmotionalTone`, `ThematicTag`, `BoundaryReason`, `Message`, `MemoryChunk`, `Citation`, `ReflectionAnswer`, `DemoSession`
    - Add request/response models for every endpoint per the design's "API request/response shapes" section
    - Validate Pydantic field constraints (intensity 0..1, citation confidence 0..1, theme list bounds)
    - _Requirements: 3.3, 4.1, 4.2, 4.3, 5.1, 6.4, 7.5_

- [x] 3. Build backend services (parser → chunker → enricher → embedder → stores)
  - [x] 3.1 Implement WhatsApp parser
    - Create `app/services/parser.py` with `WhatsAppParser` class that takes raw `.txt` bytes and returns `list[Message]`
    - Handle iOS and Android variants, multi-line messages, and system messages ("end-to-end encrypted", forwarded notices)
    - Raise `ApiError("INVALID_FILE_FORMAT", ...)` when the file does not look like a WhatsApp export
    - _Requirements: 2.2, 2.4_

  - [x] 3.2 Write property test for parser round-trip
    - **Property 1: WhatsApp parser round-trip preserves messages**
    - **Validates: Requirements 2.2**
    - File: `tests/unit/test_parser.py`. Use `hypothesis` with a `whatsapp_export_strategy` that formats `Message[]` into canonical WhatsApp lines, parses, and asserts line count, sender, timestamp, and content equality
    - Tag the test with: `# Feature: mvp-live-demo, Property 1: WhatsApp parser round-trip preserves messages`
    - _Requirements: 2.2_

  - [x] 3.3 Implement Temporal Emotional Chunker
    - Create `app/services/chunker.py` implementing the algorithm from the design (TIME_GAP_MINUTES=30, MIN=3, MAX=50, lexical pre-filter for emotional shift)
    - Return `MemoryChunk[]` with `boundary_reason` set per the enum
    - Handle empty input, single-message input, and exact 30-minute gap edge case
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

  - [x] 3.4 Write property tests for chunker invariants
    - **Property 2: Chunker preserves message membership**
    - **Property 3: Chunker respects size bounds**
    - **Property 4: Time-gap boundaries are correctly detected**
    - **Validates: Requirements 3.1, 3.2, 3.5**
    - File: `tests/unit/test_chunker.py` with three property tests using a `messages_strategy` generator
    - Tag each test with `# Feature: mvp-live-demo, Property N: <text>`
    - _Requirements: 3.1, 3.2, 3.5_

  - [x] 3.5 Implement Groq client wrapper and Emotional Enricher
    - Create `app/infrastructure/groq_client.py` — thin async wrapper around the Groq SDK with JSON-mode helper and a tolerant JSON parser
    - Create `app/services/enricher.py` with `EmotionalEnricher` issuing one Groq call per chunk using the system prompt from the design; batch via `asyncio.gather` with a concurrency cap of 5
    - Implement the documented fallback (`primary_tone="reflective"`, `intensity=0.5`, `themes=["growth"]`) on parse failure
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 3.6 Write property test for enricher output validity (LLM mocked)
    - **Property 5: Enricher produces valid emotional metadata**
    - **Validates: Requirements 4.1, 4.2, 4.3**
    - Inject a `FakeGroqClient` returning canned schema-valid JSON; assert returned chunk has `primary_tone ∈ EmotionalTone`, `intensity ∈ [0,1]`, and non-empty `themes ⊆ ThematicTag`
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 3.7 Implement Embedder
    - Create `app/services/embedder.py` wrapping `sentence-transformers` BGE-small-en-v1.5; lazy-load the model on first call
    - Expose `embed(text: str) -> list[float]` returning a 384-dim vector and `embed_batch(texts: list[str])`
    - _Requirements: 5.1_

  - [x] 3.8 Write property test for embedding dimensionality
    - **Property 6: Embedding has fixed dimensionality**
    - **Validates: Requirements 5.1**
    - Use a deterministic 384-dim hash projection mock for the model so the test runs fast; assert length == 384 and finite L2 norm for any non-empty string
    - _Requirements: 5.1_

  - [x] 3.9 Implement vector store (Qdrant local) and metadata store (SQLite)
    - Create `app/infrastructure/vector_store.py` wrapping `qdrant-client` in local/embedded mode using `QDRANT_PATH`; collection `memories` with HNSW defaults; payload includes `session_id`, `source`, `text`, `start_time`, `end_time`, `primary_tone`, `intensity`, `themes`
    - Index `session_id` for filter-pushdown
    - Create `app/infrastructure/metadata_store.py` using SQLModel + SQLite (file-backed) for chunk metadata and session rows
    - Expose `upsert_chunk`, `search(session_id, query_vec, limit, filters)`, `delete_session(session_id)` on the vector store
    - _Requirements: 5.2, 5.3, 6.2, 6.3_

- [x] 4. Backend pipeline orchestration and API endpoints
  - [x] 4.1 Implement `Pipeline` orchestrator
    - Create `app/services/pipeline.py` with `run_upload(session_id, raw_bytes, filename)` chaining parser → chunker → enricher → embedder → vector_store → metadata_store
    - Capture per-stage timings (`parse_ms`, `chunk_ms`, `enrich_ms`, `embed_ms`, `store_ms`)
    - Return the `upload` response shape from the design (`parsed`, `chunks[]`, `pipeline`)
    - _Requirements: 2.3, 3.4, 4.4, 5.4_

  - [x] 4.2 Implement `/api/v1/memories/upload` endpoint
    - Create `app/api/v1/memories.py` with the upload route accepting multipart `file`, enforcing `MAX_UPLOAD_MB` (5 MB → `FILE_TOO_LARGE`), validating the `X-Session-Id` header (`MISSING_SESSION` / `SESSION_NOT_FOUND`)
    - Delegate to `Pipeline.run_upload`; return the standard envelope
    - _Requirements: 2.1, 2.5, 5.4_

  - [x] 4.3 Implement `/api/v1/memories/search` endpoint
    - In `app/api/v1/memories.py`, add the search route accepting `{ query, limit?, filters? }`
    - Embed the query, call `vector_store.search` with `session_id` filter, return top-5 chunks with similarity scores in non-increasing order
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 4.4 Implement Reflector and Grounding Validator
    - Create `app/services/reflector.py` performing query-embed → vector_store.search(top_k=5, session-filtered) → Groq prompt with the fixed ethics preamble from the design → draft answer
    - Create `app/services/validator.py` that splits the draft into sentences, asks the LLM for per-claim grounding confidence, and emits `Citation[]` only for sentences with confidence ≥ 0.7; sub-threshold sentences become `[INFERENCE]` or are dropped
    - Handle the impersonation refusal path (forward canned ethical refusal with empty citations)
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 11.1, 11.3_

  - [x] 4.5 Implement `/api/v1/chat/reflect` endpoint
    - Create `app/api/v1/chat.py` with the reflection route accepting `{ message, history? }` and returning `ReflectionAnswer`
    - Wire `Reflector` + `GroundingValidator` and surface `UPSTREAM_LLM_ERROR` on Groq non-2xx
    - _Requirements: 7.1, 7.5_

- [x] 5. Demo session management and synthetic seed data
  - [x] 5.1 Author synthetic seed assets in `app/data/seed/`
    - `whatsapp_sample.txt` (~30 messages over 6 months, fictional names: Asha, Riya, Marco; themes: encouragement, reflection, uncertainty)
    - `journal_entries.json` (3 entries from different periods covering growth, identity)
    - `voice_note.json` (1 entry, ~120 words transcript covering reflection)
    - Avoid any real-person referents
    - _Requirements: 8.3, 8.4, 8.5_

  - [x] 5.2 Implement `SessionManager`
    - Create `app/infrastructure/session_manager.py` with in-memory session registry plus SQLite persistence; `create()`, `get()`, `is_expired()`, `sweep_expired()`
    - Compute `expires_at = created_at + SESSION_TTL_HOURS`
    - On `sweep_expired`, call `vector_store.delete_session` and remove SQLite rows
    - _Requirements: 8.2, 11.4, 11.5_

  - [x] 5.3 Implement `scripts/seed_demo.py` and `/api/v1/demo/initialize`
    - `scripts/seed_demo.py` idempotently runs the full pipeline over the seed assets, writes a gzipped enriched output cache so repeat runs skip the LLM, and registers a "demo" session template
    - Create `app/api/v1/demo.py` with `POST /api/v1/demo/initialize` that clones the cached demo data into a fresh `session_id`, returning `{ session_id, expires_at, chunk_count, sources[], suggested_questions[] }`
    - Wire all v1 routers in `app/main.py`
    - _Requirements: 8.1, 8.2, 8.6, 8.7, 7.8_

  - [x] 5.4 Wire background expiry sweep
    - In `app/main.py` startup, launch an `asyncio` task that calls `SessionManager.sweep_expired` every 5 minutes
    - On `SIGTERM`, flush all non-seed sessions (delete vector points and SQLite rows) before shutdown
    - _Requirements: 11.4, 11.5_

- [x] 6. Backend integration tests (FastAPI TestClient + mocked Groq)
  - [x] 6.1 Write integration test for session-scoped search isolation
    - **Property 7: Search returns only chunks belonging to the session**
    - **Validates: Requirements 6.2, 6.3, 8.6, 11.4**
    - File: `tests/integration/test_full_pipeline.py`. Initialize two demo sessions, upload distinct payloads, run `/memories/search` against each session_id, assert no cross-session leakage in returned `chunk_id`s
    - _Requirements: 6.2, 6.3, 8.6, 11.4_

  - [x] 6.2 Write integration test for search ordering
    - **Property 8: Search results are ordered by relevance**
    - **Validates: Requirements 6.4**
    - Assert returned `score[i] >= score[i+1]` for any non-empty result list
    - _Requirements: 6.4_

  - [x] 6.3 Write integration tests for citation correctness
    - **Property 9: Citations reference real, retrieved chunks**
    - **Property 10: Citations meet the confidence floor**
    - **Validates: Requirements 7.4, 7.5, 7.6**
    - Use `FakeGroqClient` returning canned drafts and per-sentence grounding scores; assert every `Citation.chunk_id` was in the retrieval context and every `Citation.confidence ≥ 0.7`
    - _Requirements: 7.4, 7.5, 7.6_

  - [x] 6.4 Write integration test for session expiry cleanup
    - **Property 11: Session expiry deletes session data**
    - **Validates: Requirements 11.4, 11.5**
    - Create a session with `expires_at` in the past, run the sweep, assert zero Qdrant points and zero SQLite rows remain for that `session_id`
    - _Requirements: 11.4, 11.5_

  - [x] 6.5 Write unit tests for validator edge cases
    - File: `tests/unit/test_validator.py`. Cover: answer with no claims, answer with all claims grounded, mixed `[INFERENCE]` claims, all-claims-below-threshold (must yield "I don't see enough..." style answer with empty citations)
    - _Requirements: 7.4, 7.6_

- [x] 7. Backend deployment artifacts
  - [x] 7.1 Author `Dockerfile` and `docker-compose.yml`
    - `Dockerfile`: Python 3.11 slim base, install `pyproject.toml` deps, copy `app/`, run `uvicorn app.main:app --host 0.0.0.0 --port 8000`
    - `docker-compose.yml`: backend service + qdrant service with a persistent volume mounted at `QDRANT_PATH`; expose 8000
    - Verify `make docker` brings up the stack and `/api/v1/health` returns ok
    - _Requirements: 1.1, 1.5_

- [x] 8. Checkpoint — Backend complete and self-tested
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Frontend API client and shared types
  - [x] 9.1 Generate `src/services/api-types.ts` from backend OpenAPI
    - In the frontend repo, add an `openapi-typescript` devDependency
    - Add a `package.json` script `sync-types` that runs `bunx openapi-typescript http://localhost:8000/openapi.json -o src/services/api-types.ts`
    - Run it once against the backend to commit the initial generated file
    - _Requirements: 1.3, 9.3_

  - [x] 9.2 Implement `src/services/api-client.ts`
    - Typed `fetch` wrapper reading `import.meta.env.VITE_BACKEND_URL`
    - Auto-attach `X-Session-Id` from `sessionStorage` when present
    - Parse the `{ status, data, error }` envelope; throw a typed `ApiError(code, message, status)` on error
    - Export one function per endpoint: `initializeDemo`, `uploadMemories`, `searchMemories`, `reflect`, `getHealth`
    - Add `VITE_BACKEND_URL=http://localhost:8000` to a frontend `.env.example`
    - _Requirements: 1.3, 9.3, 9.4_

- [x] 10. Frontend hooks and React Query integration
  - [x] 10.1 Implement `src/hooks/use-demo-session.ts`
    - `useInitializeDemo` mutation that persists `session_id` to `sessionStorage` on success
    - `useDemoSession` query (5-minute stale time) that hydrates UI from session metadata
    - On `ApiError(code === "SESSION_NOT_FOUND")`, clear `sessionStorage` and surface a re-init prompt
    - _Requirements: 8.1, 8.2, 9.4, 11.4_

  - [x] 10.2 Implement `src/hooks/use-pipeline-status.ts` and remaining mutations
    - Derive UI stage state from the upload mutation's per-stage timing payload (parse → chunk → enrich → embed → store)
    - Expose `useUploadMemories` (invalidates `['session']` on success), `useSearchMemories`, `useReflect` mutations
    - Configure React Query with `retry: 1` for queries and `retry: 0` for mutations
    - _Requirements: 5.5, 9.5, 10.1_

- [x] 11. Frontend demo components
  - [x] 11.1 Build `src/components/demo/DemoHero.tsx` and `ErrorState.tsx`
    - `DemoHero`: heading, subhead, two CTAs ("Try with sample data" / "Upload your own")
    - `ErrorState`: full-page banner with retry button, used when the demo route detects backend unreachable on mount
    - Match existing design system (glass + glow-border, gradient utilities, Framer Motion entrance)
    - _Requirements: 8.7, 9.4, 9.6_

  - [x] 11.2 Build `src/components/demo/UploadZone.tsx`
    - Dropzone accepting `.txt` only, rejects non-`.txt` and files > 5 MB inline (no toast)
    - Calls `useUploadMemories` and renders progress while pending
    - _Requirements: 2.6, 9.4_

  - [x] 11.3 Build `src/components/demo/PipelineStages.tsx` and `BeforeAfterCompare.tsx`
    - `PipelineStages`: animated stage visualizer (parsing → chunking → enrichment → embedding → storage) driven by `use-pipeline-status`
    - `BeforeAfterCompare`: tabs / split view showing raw messages vs the resulting emotional chunks; annotate each chunk boundary with its `boundary_reason`
    - _Requirements: 3.4, 9.5, 10.1, 10.2, 10.3_

  - [x] 11.4 Build `src/components/demo/MemoryChunkCard.tsx` and `ChunkList.tsx`
    - `MemoryChunkCard`: chunk text excerpt, primary tone badge, intensity meter (Progress component), theme tags, time span
    - `ChunkList`: scrollable list with virtualized-friendly layout; supports a "selected chunk" expanded state
    - _Requirements: 4.5, 5.5, 6.5_

  - [x] 11.5 Build `src/components/demo/CitationBadge.tsx`
    - Color-coded confidence pill: ≥0.9 emerald, 0.7–0.9 cobalt, <0.7 muted-foreground
    - Hover/click shows source description, date, and excerpt
    - _Requirements: 7.7, 10.5_

  - [x] 11.6 Build `src/components/demo/ReflectionChat.tsx`
    - Chat surface reusing existing `chat.tsx` visuals; calls `useReflect`
    - Renders the answer with inline `CitationBadge`s; preserves `[INFERENCE]` markers visually
    - Disables the send button while a mutation is pending
    - Visible "Analytical Companion Mode" indicator
    - Renders 3–4 suggested starter questions sourced from the initialize response
    - _Requirements: 7.7, 7.8, 9.5, 10.4, 11.2_

- [x] 12. Frontend route wiring and navigation
  - [x] 12.1 Create `src/routes/demo.tsx`
    - File-based route at `/demo` composing `DemoHero` → `UploadZone` / sample CTA → `PipelineStages` → `BeforeAfterCompare` → `ChunkList` → `ReflectionChat`
    - On mount, ping `getHealth`; render `ErrorState` if it fails
    - Guided three-step layout: Initialize → Explore Memories → Reflect
    - Responsive at 320px, 768px, 1024px breakpoints
    - _Requirements: 9.1, 9.2, 9.4, 9.6, 9.7_

  - [x] 12.2 Add `/demo` link to `src/components/site-shell.tsx`
    - Insert nav item between `Reflect` and `Waitlist`
    - Match existing nav styling and active-state indicator
    - _Requirements: 9.1_

- [x] 13. Frontend component tests (Vitest + RTL)
  - [x] 13.1 Tests for `UploadZone`
    - File rejected when not `.txt` (asserts inline error text)
    - File rejected when > 5 MB (asserts inline error text)
    - Valid `.txt` triggers `useUploadMemories`
    - _Requirements: 2.6_

  - [x] 13.2 Tests for `CitationBadge`
    - Confidence 0.95 → emerald class
    - Confidence 0.8 → cobalt class
    - Confidence 0.5 → muted-foreground class
    - _Requirements: 7.7, 10.5_

  - [x] 13.3 Tests for `ReflectionChat`
    - Send button disabled while mutation pending
    - "Analytical Companion Mode" indicator is visible
    - Suggested-question chip click populates the composer
    - _Requirements: 7.7, 7.8, 11.2_

  - [x] 13.4 Test for `useDemoSession` session-not-found handling
    - Stub `useInitializeDemo` to throw `ApiError("SESSION_NOT_FOUND")`; assert `sessionStorage` is cleared
    - _Requirements: 11.4_

- [x] 14. End-to-end manual smoke test checklist
  - [x] 14.1 Author `~/Demo for EchoVaultAI/echovault-backend-demo/SMOKE_TEST.md`
    - Document the two-terminal startup (backend `make dev`, frontend `bun dev`)
    - Steps: open `/demo` → click "Try with sample data" → verify chunks render with tone/intensity → ask a starter question → verify cited answer with confidence badges → upload `whatsapp_sample.txt` manually → verify pipeline stages animate → verify chat works against uploaded data → wait for session expiry sweep (or trigger manually) → verify search returns empty for the expired session
    - Include a checkbox for each step; record pass/fail and notes
    - _Requirements: 9.1, 9.2, 9.4, 10.1, 10.4, 11.5_

- [x] 15. Final checkpoint — Ensure all tests pass and demo runs end-to-end
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP path; the parent agent MUST NOT auto-implement them.
- Backend tasks (1–8) live in the NEW sibling repo `~/Demo for EchoVaultAI/echovault-backend-demo/`. Frontend tasks (9–13) live in the EXISTING repo `~/Demo for EchoVaultAI/echo-vault-intelligence/`.
- The seed data (Task 5.1) and `/demo/initialize` endpoint (Task 5.3) are intentionally scheduled before frontend integration so the UI can call a working sample-data path before the user-upload pipeline is wrapped up.
- Property-based tests use `hypothesis` (≥100 examples per property) with mocked Groq and a deterministic 384-dim hash projection mock for the embedder. Real Groq is exercised only by an out-of-CI smoke test.
- Each property test is annotated with `# Feature: mvp-live-demo, Property N: <text>` per the design's testing convention.
- Checkpoints (Tasks 8 and 15) are gates, not coding tasks; they ask the user before proceeding.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "2.1"] },
    { "id": 2, "tasks": ["3.1", "3.3", "3.5", "3.7", "3.9", "5.1"] },
    { "id": 3, "tasks": ["3.2", "3.4", "3.6", "3.8", "4.1", "5.2", "7.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "4.4", "5.3"] },
    { "id": 5, "tasks": ["4.5", "5.4", "9.1"] },
    { "id": 6, "tasks": ["6.1", "6.2", "6.3", "6.4", "6.5", "9.2"] },
    { "id": 7, "tasks": ["10.1", "10.2"] },
    { "id": 8, "tasks": ["11.1", "11.2", "11.3", "11.4", "11.5", "11.6"] },
    { "id": 9, "tasks": ["12.1"] },
    { "id": 10, "tasks": ["12.2", "13.1", "13.2", "13.3", "13.4"] },
    { "id": 11, "tasks": ["14.1"] }
  ]
}
```
