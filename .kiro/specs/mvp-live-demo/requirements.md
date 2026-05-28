# Requirements Document

## Introduction

The MVP Live Demo is a functional demonstration of EchoVault AI's core Temporal Emotional RAG pipeline. It connects the existing TanStack Start frontend to a real FastAPI backend, enabling visitors to experience the full workflow: uploading memories (WhatsApp exports), watching them processed through emotional chunking and embedding, and querying them via an AI reflection chat that returns grounded, cited responses. The demo uses pre-loaded synthetic data for privacy but runs the actual AI pipeline (LLaMA-3 via Groq, BGE-small-en-v1.5 embeddings, Qdrant vector search). The backend lives in a separate repository (`echovault-backend-demo`).

## Glossary

- **Frontend**: The TanStack Start application (React 19, Tailwind v4, shadcn/ui, Framer Motion) serving the user interface
- **Backend**: The FastAPI Python application that orchestrates the AI pipeline and exposes REST API endpoints
- **Upload_Pipeline**: The backend processing chain: parsing → temporal chunking → emotional enrichment → embedding generation → storage in Qdrant and PostgreSQL
- **Temporal_Chunker**: The component that splits conversations into chunks based on emotional continuity and time proximity rather than fixed token counts
- **Emotional_Enricher**: The component that analyzes each chunk to assign emotional tags (tone, intensity, theme) using the LLM
- **Embedding_Generator**: The component that produces 384-dimensional vector embeddings using BGE-small-en-v1.5 via HuggingFace
- **Qdrant_Store**: The Qdrant vector database instance storing memory embeddings with emotional metadata as payload
- **Reflection_Engine**: The backend component that takes a user query, retrieves relevant memories via hybrid search, validates grounding, and generates an analytical response using LLaMA-3 via Groq
- **Grounding_Validator**: The component that ensures every claim in a response is traceable to a specific memory chunk with a confidence score
- **Demo_Session**: A scoped session using pre-loaded synthetic data so each demo user operates on a consistent dataset
- **Memory_Chunk**: A segment of a conversation or journal entry produced by the Temporal_Chunker, stored with temporal and emotional metadata
- **Citation**: A reference linking a response claim to a specific Memory_Chunk, including source identifier, date, and confidence score
- **API_Client**: The frontend service layer that communicates with the Backend via HTTP requests

## Requirements

### Requirement 1: Backend API Foundation

**User Story:** As a frontend developer, I want a well-defined REST API, so that the frontend can communicate with the backend pipeline reliably.

#### Acceptance Criteria

1. THE Backend SHALL expose a REST API at a configurable base URL with versioned endpoints under `/api/v1`
2. THE Backend SHALL accept CORS requests from the Frontend origin
3. THE Backend SHALL return JSON responses with consistent structure including `status`, `data`, and `error` fields
4. IF the Backend encounters an unhandled error, THEN THE Backend SHALL return a structured error response with an appropriate HTTP status code and descriptive message
5. THE Backend SHALL expose a health check endpoint at `/api/v1/health` that returns service status and dependency availability (Qdrant, PostgreSQL, Groq)

### Requirement 2: Memory Upload and Parsing

**User Story:** As a demo user, I want to upload a WhatsApp export file, so that my memories enter the EchoVault pipeline.

#### Acceptance Criteria

1. THE Backend SHALL expose a POST endpoint at `/api/v1/memories/upload` that accepts text file uploads (WhatsApp .txt export format)
2. WHEN a file is uploaded, THE Backend SHALL parse the WhatsApp export into individual messages with sender, timestamp, and content fields
3. WHEN parsing completes, THE Backend SHALL return a response containing the total message count, date range covered, and unique participants detected
4. IF an uploaded file is not in a recognized WhatsApp export format, THEN THE Backend SHALL return a 422 error with a descriptive message indicating the expected format
5. THE Backend SHALL limit upload file size to 5 MB for the demo
6. THE Frontend SHALL display a file upload interface on the demo page that accepts .txt files and shows upload progress

### Requirement 3: Temporal Emotional Chunking

**User Story:** As a demo user, I want to see how EchoVault chunks memories by emotional continuity, so that I understand the core innovation.

#### Acceptance Criteria

1. WHEN messages are parsed, THE Temporal_Chunker SHALL group messages into Memory_Chunks based on time proximity (messages within 30 minutes of each other) and emotional continuity (consistent emotional tone)
2. THE Temporal_Chunker SHALL produce chunks that contain between 3 and 50 messages each
3. WHEN chunking completes, THE Backend SHALL return metadata for each chunk including message count, time span, and detected emotional boundary reason
4. THE Frontend SHALL display the chunking results visually, showing how messages were grouped and why boundaries were placed
5. THE Temporal_Chunker SHALL split a chunk at an emotional boundary when the detected tone shifts significantly between consecutive messages, even if they are within the time proximity window

### Requirement 4: Emotional Enrichment

**User Story:** As a demo user, I want to see emotional tags assigned to my memory chunks, so that I understand how EchoVault interprets emotional patterns.

#### Acceptance Criteria

1. WHEN a Memory_Chunk is created, THE Emotional_Enricher SHALL analyze it and assign a primary emotional tone (one of: reflective, encouraging, anxious, grateful, uncertain, joyful, grieving, determined)
2. THE Emotional_Enricher SHALL assign an emotional intensity score between 0.0 and 1.0 to each chunk
3. THE Emotional_Enricher SHALL assign one or more thematic tags (such as: career, relationships, growth, loss, creativity) to each chunk
4. WHEN enrichment completes for all chunks, THE Backend SHALL return the enrichment results as part of the processing response
5. THE Frontend SHALL display emotional tags and intensity visually on each memory chunk card

### Requirement 5: Embedding Generation and Vector Storage

**User Story:** As a demo user, I want my memories stored as searchable vectors, so that the AI can retrieve them semantically.

#### Acceptance Criteria

1. WHEN a Memory_Chunk is enriched, THE Embedding_Generator SHALL produce a 384-dimensional vector embedding using the BGE-small-en-v1.5 model
2. THE Backend SHALL store each embedding in Qdrant_Store with a payload containing the chunk text, source metadata, timestamps, emotional tags, and intensity score
3. THE Backend SHALL store chunk metadata (source file, participant names, date range, emotional tags) in PostgreSQL for relational queries
4. WHEN all chunks are embedded and stored, THE Backend SHALL return a confirmation with the total number of vectors stored and processing duration
5. THE Frontend SHALL display a processing progress indicator during embedding generation and storage

### Requirement 6: Hybrid Memory Retrieval

**User Story:** As a demo user, I want to query my memories semantically, so that I can find relevant memories by meaning rather than keywords.

#### Acceptance Criteria

1. THE Backend SHALL expose a POST endpoint at `/api/v1/memories/search` that accepts a natural language query string
2. WHEN a search query is received, THE Backend SHALL generate an embedding for the query and perform a vector similarity search against Qdrant_Store
3. THE Backend SHALL combine vector similarity results with metadata filtering (emotional tags, date ranges) for hybrid retrieval
4. THE Backend SHALL return the top 5 most relevant Memory_Chunks with similarity scores, source metadata, and emotional tags
5. THE Frontend SHALL display search results as memory cards with relevance scores and source attribution

### Requirement 7: Reflection Chat with Grounded Responses

**User Story:** As a demo user, I want to have a reflective conversation with the AI about my memories, so that I can experience EchoVault's analytical companion.

#### Acceptance Criteria

1. THE Backend SHALL expose a POST endpoint at `/api/v1/chat/reflect` that accepts a user message and session context
2. WHEN a chat message is received, THE Reflection_Engine SHALL retrieve relevant Memory_Chunks via hybrid search and pass them as context to LLaMA-3 via Groq
3. THE Reflection_Engine SHALL instruct the LLM to respond as an analytical companion: observing patterns, noting themes, and reflecting — never simulating a person or providing therapy
4. THE Grounding_Validator SHALL verify that every factual claim in the response maps to a specific Memory_Chunk with a confidence score of 0.7 or higher
5. THE Backend SHALL return the response with an array of Citations, each containing the source Memory_Chunk identifier, source description, date, and confidence score
6. IF the Grounding_Validator cannot ground a claim above 0.7 confidence, THEN THE Reflection_Engine SHALL either remove the claim or explicitly mark it as an inference with reduced confidence
7. THE Frontend SHALL display chat responses with inline citation badges showing source and confidence percentage
8. THE Frontend SHALL provide 3-4 suggested starter questions relevant to the uploaded memories

### Requirement 8: Demo Session Management

**User Story:** As a demo user, I want a self-contained demo experience with pre-loaded data, so that I can explore without uploading my own files.

#### Acceptance Criteria

1. THE Backend SHALL provide a POST endpoint at `/api/v1/demo/initialize` that creates a demo session pre-loaded with synthetic sample data
2. WHEN a demo session is initialized, THE Backend SHALL return a session identifier that the Frontend uses for subsequent API calls
3. THE Demo_Session SHALL contain pre-processed synthetic data: one WhatsApp conversation (20+ messages spanning 6 months), three journal entries from different periods, and one voice note transcript
4. THE Demo_Session synthetic data SHALL cover emotional themes of encouragement, reflection, uncertainty, and growth
5. THE Demo_Session synthetic data SHALL use fictional but realistic content that does not reference real individuals
6. WHEN the demo session is initialized, THE Backend SHALL have the sample data already chunked, enriched, embedded, and stored so that search and chat work immediately
7. THE Frontend SHALL offer both "Try with sample data" (instant) and "Upload your own" (runs pipeline) options on the demo page

### Requirement 9: Frontend Demo Page Integration

**User Story:** As a site visitor, I want a dedicated demo page that connects to the real backend, so that I can experience EchoVault's actual capabilities.

#### Acceptance Criteria

1. THE Frontend SHALL serve a demo page at the `/demo` route accessible from the site navigation
2. THE Frontend SHALL display a guided experience with clear steps: Initialize → Explore Memories → Reflect
3. THE Frontend SHALL communicate with the Backend via the API_Client using the configured backend URL
4. WHEN the Backend is unreachable, THE Frontend SHALL display a clear error state with a retry option rather than crashing
5. THE Frontend SHALL display the processing pipeline stages visually when a user uploads their own file (parsing → chunking → enrichment → embedding)
6. THE Frontend SHALL maintain visual consistency with the existing EchoVault design system (glass morphism, gradient accents, Framer Motion animations)
7. THE Frontend SHALL be responsive across mobile (320px+), tablet (768px+), and desktop (1024px+) viewports

### Requirement 10: Pipeline Transparency

**User Story:** As a demo user, I want to see how the Temporal Emotional RAG pipeline works internally, so that I understand EchoVault's technical innovation.

#### Acceptance Criteria

1. WHEN the processing pipeline runs, THE Frontend SHALL display each stage with a label, description, and visual progress indicator
2. THE Frontend SHALL show a "before and after" comparison: raw messages versus the resulting emotional chunks, demonstrating that chunking is by emotional continuity not token count
3. WHEN chunking results are displayed, THE Frontend SHALL annotate chunk boundaries with the reason (time gap, emotional shift, topic change)
4. WHEN a chat response is returned, THE Frontend SHALL display the retrieval process: query → matched memories → grounded response, making the RAG pipeline visible
5. THE Frontend SHALL display confidence scores on citations using a color-coded scale (green for high confidence above 0.9, amber for moderate 0.7-0.9)

### Requirement 11: Ethical AI Guardrails

**User Story:** As a demo user, I want to see that EchoVault operates ethically, so that I trust the platform with sensitive memories.

#### Acceptance Criteria

1. THE Reflection_Engine SHALL prefix its system prompt with instructions to never impersonate a person, never provide therapy or medical advice, and always respond as an analytical companion
2. THE Frontend SHALL display a visible "Analytical Companion Mode" indicator during the reflection chat
3. THE Reflection_Engine SHALL decline to answer questions that request impersonation of a person referenced in the memories and instead explain its ethical boundary
4. THE Backend SHALL not persist any user-uploaded data beyond the demo session lifetime
5. WHEN a demo session ends or the browser session expires, THE Backend SHALL delete all user-uploaded data associated with that session within 1 hour

