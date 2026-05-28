/**
 * Upload zone for the demo page.
 *
 * Accepts a single WhatsApp `.txt` export, validates it client-side, and hands
 * the file to the backend pipeline via `useUploadMemories`. Validation errors
 * (wrong extension, file too large) render inline beneath the dropzone — they
 * are NOT surfaced through toast notifications, per the task spec.
 *
 * While the mutation is pending, the dropzone swaps to a progress state
 * showing a spinner and the file name. Per-stage progress is rendered by
 * `PipelineStages`, which composes downstream of this component.
 *
 * Validates Requirements: 2.6, 9.4.
 */

import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { Loader2, Upload, FileText, AlertCircle } from "lucide-react";
import { useUploadMemories } from "../../hooks/use-memory-mutations";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB — matches backend MAX_UPLOAD_MB
const ACCEPTED_EXTENSION = ".txt";

function isTxtFile(file: File): boolean {
  // The browser-reported MIME type is unreliable across OSes; fall back to the
  // extension. Accept either signal as a positive match.
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith(ACCEPTED_EXTENSION)) return true;
  if (file.type === "text/plain") return true;
  return false;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadZone() {
  const upload = useUploadMemories();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function validateAndUpload(file: File): void {
    if (!isTxtFile(file)) {
      setError("Only .txt files are accepted");
      setSelectedFile(null);
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("File too large (max 5 MB)");
      setSelectedFile(null);
      return;
    }
    setError(null);
    setSelectedFile(file);
    upload.mutate(file);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (file) {
      validateAndUpload(file);
    }
    // Reset the input so re-uploading the same file fires `change` again.
    event.target.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>): void {
    event.preventDefault();
    if (!isDragging) setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>): void {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>): void {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      validateAndUpload(file);
    }
  }

  const isPending = upload.isPending;
  // Translate the API client's typed error into a user-facing string.
  const mutationErrorMessage =
    upload.isError && upload.error
      ? upload.error.code === "FILE_TOO_LARGE"
        ? "File too large (max 5 MB)"
        : upload.error.code === "INVALID_FILE_FORMAT"
          ? "That file doesn't look like a WhatsApp export"
          : upload.error.message || "Upload failed. Please try again."
      : null;

  const displayError = error ?? mutationErrorMessage;

  const baseSurface =
    "glass glow-border relative flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl px-6 py-14 text-center transition";
  const surfaceState = isDragging
    ? "border-2 border-dashed border-[color:var(--accent)] bg-[color:var(--accent)]/5"
    : "border-2 border-dashed border-border hover:border-[color:var(--accent)]/40";
  const cursorState = isPending ? "cursor-wait opacity-90" : "";

  return (
    <div className="w-full">
      <label
        htmlFor="upload-zone-input"
        className={`${baseSurface} ${surfaceState} ${cursorState}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-busy={isPending || undefined}
        aria-disabled={isPending || undefined}
      >
        <input
          ref={inputRef}
          id="upload-zone-input"
          type="file"
          accept=".txt,text/plain"
          className="sr-only"
          onChange={handleInputChange}
          disabled={isPending}
        />

        {isPending ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2
              className="h-10 w-10 animate-spin text-[color:var(--accent)]"
              aria-hidden
            />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Processing your upload…
              </p>
              {selectedFile ? (
                <p className="text-xs text-muted-foreground">
                  {selectedFile.name} · {formatBytes(selectedFile.size)}
                </p>
              ) : null}
            </div>
            <div
              className="h-1 w-48 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label="Upload progress"
            >
              <div className="h-full w-1/3 animate-pulse rounded-full bg-[color:var(--accent)]" />
            </div>
          </div>
        ) : selectedFile && upload.isSuccess ? (
          <div className="flex flex-col items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--accent)]/10">
              <FileText
                className="h-6 w-6 text-[color:var(--accent)]"
                aria-hidden
              />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Upload complete
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedFile.name} · {formatBytes(selectedFile.size)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Drop another file or browse to replace
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary">
              <Upload
                className="h-6 w-6 text-muted-foreground"
                aria-hidden
              />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Drop your WhatsApp export here
              </p>
              <p className="text-xs text-muted-foreground">
                or <span className="text-foreground underline">browse</span> to
                upload a .txt file (max 5 MB)
              </p>
            </div>
          </div>
        )}
      </label>

      {displayError ? (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{displayError}</span>
        </div>
      ) : null}
    </div>
  );
}
