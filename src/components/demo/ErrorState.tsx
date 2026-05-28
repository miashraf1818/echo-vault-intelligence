import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  /** Called when the user clicks the retry button. */
  onRetry?: () => void;
  /** Optional override for the body copy. */
  message?: string;
  /** Optional title override. */
  title?: string;
  /** Disables the retry button while a retry is in flight. */
  isRetrying?: boolean;
}

/**
 * Full-page error banner shown when the backend is unreachable on mount of the
 * demo route (Requirement 9.4). Designed to take over the page so users get a
 * clear failure state with a retry path instead of a broken UI.
 */
export function ErrorState({
  onRetry,
  message,
  title = "We can't reach the demo backend right now.",
  isRetrying = false,
}: ErrorStateProps) {
  const body =
    message ??
    "The EchoVault demo service didn't respond. This is usually transient — give it a moment and try again. If it keeps failing, the backend may be restarting.";

  return (
    <motion.div
      role="alert"
      aria-live="assertive"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center px-4 py-16 text-center"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="glass glow-border w-full rounded-2xl p-8 shadow-[var(--shadow-card)]"
      >
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]">
          <AlertTriangle className="h-5 w-5" />
        </div>

        <h2 className="mt-5 text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground md:text-base">
          {body}
        </p>

        {onRetry && (
          <div className="mt-6 flex justify-center">
            <Button
              type="button"
              size="lg"
              onClick={onRetry}
              disabled={isRetrying}
              className="bg-gradient-primary text-primary-foreground shadow-[var(--shadow-glow)] transition hover:opacity-95"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`}
              />
              {isRetrying ? "Retrying…" : "Retry"}
            </Button>
          </div>
        )}

        <p className="mt-5 text-xs text-muted-foreground">
          No memories are uploaded yet — nothing was lost.
        </p>
      </motion.div>
    </motion.div>
  );
}

export default ErrorState;
