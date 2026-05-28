/**
 * Tests for `UploadZone`.
 *
 * Covers Requirement 2.6 (frontend file upload validation):
 *   - non-`.txt` files are rejected inline (no toast, no upload call).
 *   - files larger than 5 MB are rejected inline.
 *   - a valid `.txt` file is forwarded to `useUploadMemories`,
 *     which delegates to `uploadMemories(file)` from the API client.
 *
 * The api-client is mocked so no real network call is made — the test only
 * asserts the call signature and that error paths short-circuit before reaching it.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

// Mock the api-client BEFORE importing UploadZone so the mutation hook picks
// up the mocked `uploadMemories` (the hook closes over the imported symbol).
vi.mock("../../../services/api-client", async () => {
  // Preserve the real `ApiError` class so the mutation hook's typing is sound,
  // but stub out the network functions.
  const actual = await vi.importActual<
    typeof import("../../../services/api-client")
  >("../../../services/api-client");
  return {
    ...actual,
    uploadMemories: vi.fn(async (_file: File) => ({
      parsed: {
        message_count: 0,
        date_range: ["2024-01-01T00:00:00Z", "2024-01-01T00:00:00Z"],
        participants: [],
      },
      chunks: [],
      pipeline: {
        parse_ms: 0,
        chunk_ms: 0,
        enrich_ms: 0,
        embed_ms: 0,
        store_ms: 0,
      },
    })),
  };
});

// Importing AFTER the mock so the module graph wires our spy in.
import { UploadZone } from "../UploadZone";
import { uploadMemories } from "../../../services/api-client";

const mockedUploadMemories = vi.mocked(uploadMemories);

function renderWithClient(ui: ReactNode) {
  // Fresh QueryClient per test, with retries off so failures surface immediately.
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

function getFileInput(): HTMLInputElement {
  // The component renders a hidden input via `<label htmlFor="upload-zone-input">`.
  // Selecting by id is the most stable handle since the input is `sr-only`.
  const input = document.getElementById(
    "upload-zone-input",
  ) as HTMLInputElement | null;
  if (!input) {
    throw new Error("upload-zone-input not found in document");
  }
  return input;
}

describe("UploadZone", () => {
  beforeEach(() => {
    mockedUploadMemories.mockClear();
  });

  it("rejects non-.txt files with an inline error", async () => {
    // `applyAccept: false` bypasses user-event's own MIME filter so the file
    // actually reaches the component's onChange handler — otherwise the
    // input's `accept=".txt,text/plain"` attribute would silently drop the
    // PDF before our validation runs.
    const user = userEvent.setup({ applyAccept: false });
    renderWithClient(<UploadZone />);

    const pdfFile = new File(["%PDF-1.4 fake"], "memories.pdf", {
      type: "application/pdf",
    });

    await user.upload(getFileInput(), pdfFile);

    expect(
      await screen.findByText(/only \.txt files are accepted/i),
    ).toBeInTheDocument();
    expect(mockedUploadMemories).not.toHaveBeenCalled();
  });

  it("rejects files larger than 5 MB with an inline error", async () => {
    const user = userEvent.setup();
    renderWithClient(<UploadZone />);

    // 6 MB of zeros, .txt extension so the only failing check is size.
    const bigTxt = new File(
      [new ArrayBuffer(6 * 1024 * 1024)],
      "big.txt",
      { type: "text/plain" },
    );

    await user.upload(getFileInput(), bigTxt);

    expect(
      await screen.findByText(/file too large \(max 5 mb\)/i),
    ).toBeInTheDocument();
    expect(mockedUploadMemories).not.toHaveBeenCalled();
  });

  it("forwards a valid .txt file to useUploadMemories", async () => {
    const user = userEvent.setup();
    renderWithClient(<UploadZone />);

    const validFile = new File(
      ["[2024-01-01, 12:00:00] Asha: hello"],
      "chat.txt",
      { type: "text/plain" },
    );

    await user.upload(getFileInput(), validFile);

    expect(mockedUploadMemories).toHaveBeenCalledTimes(1);
    expect(mockedUploadMemories).toHaveBeenCalledWith(validFile);
  });
});
