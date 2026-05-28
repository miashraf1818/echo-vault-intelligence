import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, Loader2, Send, Shield, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { useReflect } from "../../hooks/use-memory-mutations";
import type {
  ApiError,
  Citation,
  ReflectionAnswerEntry,
} from "../../services/api-client";

import { CitationBadge } from "./CitationBadge";

interface ReflectionChatProps {
  /** Suggested starter questions returned from `POST /api/v1/demo/initialize`. */
  suggestedQuestions?: string[];
  /** Optional class hook so the parent route can place the component. */
  className?: string;
}

/**
 * Chat surface for the demo route. Talks to `POST /api/v1/chat/reflect` via
 * `useReflect`, renders the grounded answer with inline `CitationBadge`s, and
 * preserves `[INFERENCE]` markers visually so viewers can see when the model
 * fell below the grounding floor.
 *
 * Visual language matches `routes/chat.tsx` — glass + glow-border surfaces,
 * gradient bubbles, Framer Motion entrance — so the demo feels like a natural
 * extension of the marketing chat.
 *
 * Validates Requirements: 7.7, 7.8, 9.5, 10.4, 11.2.
 */
export function ReflectionChat({
  suggestedQuestions,
  className,
}: ReflectionChatProps) {
  const reflect = useReflect();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [composer, setComposer] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // Always show 3–4 starters; trim defensively if the backend returns more.
  const starters = useMemo(() => {
    const list = (suggestedQuestions ?? []).filter(
      (q): q is string => typeof q === "string" && q.trim().length > 0,
    );
    return list.slice(0, 4);
  }, [suggestedQuestions]);

  // Auto-scroll to the newest message / loader.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, reflect.isPending]);

  const isPending = reflect.isPending;

  const submit = (raw: string) => {
    const message = raw.trim();
    if (!message || isPending) return;

    // Snapshot history for the backend BEFORE we append the new user turn.
    const history = toHistoryEntries(messages);
    const next: ChatMessage[] = [...messages, { role: "user", content: message }];
    setMessages(next);
    setComposer("");

    reflect.mutate(
      { message, history },
      {
        onSuccess: (answer) => {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: answer.answer,
              citations: answer.citations ?? [],
              rejected_claims: answer.rejected_claims ?? [],
            },
          ]);
        },
        // Errors are surfaced through the mutation state below; we leave the
        // user message in place so they can retry without retyping.
      },
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit(composer);
  };

  const showStarters = messages.length === 0 && starters.length > 0;
  const error = reflect.error as ApiError | null;

  return (
    <section
      aria-label="Reflection chat"
      className={cn("flex w-full flex-col gap-4", className)}
    >
      {/* Analytical Companion Mode indicator (Requirement 11.2). */}
      <div
        role="status"
        className="glass glow-border flex items-center gap-3 rounded-xl px-4 py-3 text-xs text-muted-foreground"
      >
        <Shield className="h-4 w-4 text-accent" aria-hidden="true" />
        <span>
          <span className="font-medium text-foreground">
            Analytical Companion Mode
          </span>
          <span className="mx-2 text-border">·</span>
          no impersonation · every claim cited
        </span>
        <Badge
          variant="outline"
          className="ml-auto border-accent/40 bg-accent/10 text-[10px] uppercase tracking-[0.18em] text-accent"
        >
          Live
        </Badge>
      </div>

      {/* Suggested starter questions (Requirement 7.8). */}
      {showStarters && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap gap-2"
          aria-label="Suggested starter questions"
        >
          {starters.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => {
                // Per the spec: clicking a chip populates the composer rather
                // than auto-sending, so the user stays in control.
                setComposer(question);
              }}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-accent/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Lightbulb className="h-3 w-3 text-accent" aria-hidden="true" />
              {question}
            </button>
          ))}
        </motion.div>
      )}

      {/* Message list. */}
      <div className="flex flex-1 flex-col gap-4">
        <AnimatePresence initial={false}>
          {messages.map((message, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "items-start gap-3",
              )}
            >
              {message.role === "assistant" && (
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-accent shadow-[var(--shadow-emerald)]">
                  <Sparkles
                    className="h-4 w-4 text-background"
                    aria-hidden="true"
                  />
                </div>
              )}

              {message.role === "user" ? (
                <div className="max-w-md rounded-2xl rounded-tr-md bg-gradient-primary px-5 py-3 text-sm text-primary-foreground shadow-[var(--shadow-glow)]">
                  {message.content}
                </div>
              ) : (
                <AssistantBubble message={message} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isPending && (
          <div className="flex items-start gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-accent">
              <Sparkles
                className="h-4 w-4 text-background"
                aria-hidden="true"
              />
            </div>
            <div
              className="rounded-2xl rounded-tl-md border border-border bg-card/60 px-5 py-3 backdrop-blur"
              aria-live="polite"
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                Retrieving memories…
              </div>
            </div>
          </div>
        )}

        {error && !isPending && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-xs text-destructive"
          >
            <span className="font-medium">{error.code}</span>
            <span className="mx-2 text-border">·</span>
            {error.message}
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Composer. */}
      <form
        onSubmit={handleSubmit}
        className="glass glow-border flex items-center gap-2 rounded-2xl px-3 py-2"
      >
        <Input
          value={composer}
          onChange={(event) => setComposer(event.target.value)}
          placeholder="Ask about a theme, a year, or a feeling…"
          aria-label="Reflection prompt"
          disabled={isPending}
          className="h-9 flex-1 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Send reflection prompt"
          disabled={isPending || composer.trim().length === 0}
          className="h-9 w-9 rounded-xl bg-gradient-primary text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-105 disabled:scale-100 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </section>
  );
}

export default ReflectionChat;

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

type ChatMessage =
  | { role: "user"; content: string }
  | {
      role: "assistant";
      content: string;
      citations: Citation[];
      rejected_claims: string[];
    };

// ---------------------------------------------------------------------------
// Assistant bubble — answer text + inline [INFERENCE] markers + citation row.
// ---------------------------------------------------------------------------

function AssistantBubble({
  message,
}: {
  message: Extract<ChatMessage, { role: "assistant" }>;
}) {
  return (
    <div className="max-w-2xl flex-1 rounded-2xl rounded-tl-md border border-border bg-card/60 px-5 py-4 text-sm leading-relaxed backdrop-blur">
      <p className="whitespace-pre-wrap text-foreground/95">
        {renderAnswerWithInference(message.content)}
      </p>

      {message.citations.length > 0 && (
        <div
          className="mt-3 flex flex-wrap items-center gap-1.5"
          aria-label="Citations"
        >
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Sources
          </span>
          {message.citations.map((citation, idx) => (
            <CitationBadge
              key={`${citation.chunk_id}-${idx}`}
              citation={citation}
            />
          ))}
        </div>
      )}

      {message.rejected_claims.length > 0 && (
        <details className="mt-3 text-[11px] text-muted-foreground">
          <summary className="cursor-pointer select-none hover:text-foreground">
            {message.rejected_claims.length} rejected claim
            {message.rejected_claims.length === 1 ? "" : "s"}
          </summary>
          <ul className="mt-2 space-y-1 pl-4">
            {message.rejected_claims.map((claim, idx) => (
              <li key={idx} className="list-disc italic">
                {claim}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

/**
 * Split an answer string on `[INFERENCE]` markers and render them as inline
 * italic, muted-foreground tokens so viewers can tell at a glance which
 * portions of the answer fell below the grounding confidence floor (and were
 * therefore not cited).
 *
 * The marker is preserved as a tiny visible badge rather than stripped, per
 * the task brief: "preserves `[INFERENCE]` markers visually".
 */
function renderAnswerWithInference(text: string): React.ReactNode {
  if (!text) return null;
  const segments = text.split("[INFERENCE]");
  // Only one segment → no markers present, render plain text.
  if (segments.length === 1) return text;

  const nodes: React.ReactNode[] = [];
  segments.forEach((segment, idx) => {
    if (segment) nodes.push(<span key={`s-${idx}`}>{segment}</span>);
    if (idx < segments.length - 1) {
      nodes.push(
        <span
          key={`m-${idx}`}
          className="mx-0.5 inline-flex items-center rounded-full border border-border bg-muted/60 px-1.5 py-0.5 align-baseline text-[10px] font-medium uppercase italic tracking-[0.12em] text-muted-foreground"
          title="This claim fell below the grounding confidence floor."
        >
          inference
        </span>,
      );
    }
  });
  return nodes;
}

// ---------------------------------------------------------------------------
// History helper — convert the local message log into the wire-format the
// backend expects. The wire schema only allows `user` / `assistant` turns,
// which already matches our local roles, so this is a small projection.
// ---------------------------------------------------------------------------

function toHistoryEntries(messages: ChatMessage[]): ReflectionAnswerEntry[] {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}
