import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DemoHeroProps {
  onTrySample: () => void;
  onUploadOwn: () => void;
  isSampleLoading?: boolean;
  isUploadDisabled?: boolean;
}

/**
 * Hero section for the /demo route.
 *
 * Renders a heading, subhead, and two distinct CTAs:
 *   1. "Try with sample data" — primary, instant path using the pre-seeded session.
 *   2. "Upload your own"      — secondary, runs the full pipeline on a user file.
 *
 * The component is presentational; the parent (`/demo` route) owns the click
 * handlers so this stays easy to test and reuse.
 */
export function DemoHero({
  onTrySample,
  onUploadOwn,
  isSampleLoading = false,
  isUploadDisabled = false,
}: DemoHeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative mx-auto max-w-3xl text-center"
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="text-xs uppercase tracking-[0.2em] text-accent"
      >
        Live demo · Temporal Emotional RAG
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl"
      >
        See EchoVault AI in action.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base"
      >
        Watch the real pipeline run end-to-end: parse a memory archive, chunk it
        by emotional continuity, embed it, and reflect on it through a grounded,
        cited conversation.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
      >
        <Button
          type="button"
          size="lg"
          onClick={onTrySample}
          disabled={isSampleLoading}
          className="bg-gradient-primary text-primary-foreground shadow-[var(--shadow-glow)] transition hover:opacity-95 hover:shadow-[var(--shadow-card)]"
        >
          <Sparkles className="h-4 w-4" />
          {isSampleLoading ? "Initializing…" : "Try with sample data"}
          <ArrowRight className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={onUploadOwn}
          disabled={isUploadDisabled}
          className="glass glow-border bg-card/60 backdrop-blur"
        >
          <Upload className="h-4 w-4" />
          Upload your own
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="mt-4 text-xs text-muted-foreground"
      >
        Sample data is fictional. Uploads stay in an ephemeral session and are
        deleted within an hour.
      </motion.p>
    </motion.section>
  );
}

export default DemoHero;
