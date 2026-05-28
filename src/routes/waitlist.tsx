import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  Loader2,
  Lock,
  Shield,
  Sparkles,
} from "lucide-react";

import { SiteFooter, SiteNav, PageBackdrop } from "@/components/site-shell";

import {
  WaitlistError,
  isValidEmail,
  joinWaitlist,
} from "../services/waitlist";

export const Route = createFileRoute("/waitlist")({
  head: () => ({
    meta: [
      { title: "Join the Waitlist — EchoVault AI" },
      {
        name: "description",
        content:
          "Be among the first to experience EchoVault AI — privacy-first emotional memory intelligence.",
      },
    ],
  }),
  component: Waitlist,
});

const perks = [
  {
    icon: Sparkles,
    title: "Founding member access",
    desc: "Early access to the private beta vault.",
  },
  {
    icon: Shield,
    title: "Privacy guarantees",
    desc: "End-to-end encrypted from the very first upload.",
  },
  {
    icon: Heart,
    title: "Shape the roadmap",
    desc: "Direct input on ethical AI features.",
  },
];

// localStorage key — flips the form into the success state on subsequent
// visits so a returning user immediately knows they're on the list.
const SIGNED_UP_STORAGE_KEY = "evd:waitlist_signup_email";

function Waitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate the success state from localStorage on mount so a returning
  // user sees confirmation rather than the form again.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(SIGNED_UP_STORAGE_KEY);
      if (stored) {
        setSubmitted(true);
        setSubmittedEmail(stored);
      }
    } catch {
      // Private mode / storage disabled — silently no-op.
    }
  }, []);

  const trimmed = email.trim();
  const emailIsValid = trimmed.length === 0 || isValidEmail(trimmed);
  const canSubmit = isValidEmail(trimmed) && !isSubmitting;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await joinWaitlist(trimmed);
      setSubmittedEmail(trimmed);
      setSubmitted(true);
      try {
        window.localStorage.setItem(SIGNED_UP_STORAGE_KEY, trimmed);
      } catch {
        // ignore — submission still succeeded
      }
    } catch (err) {
      const message =
        err instanceof WaitlistError
          ? err.message
          : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSignup = () => {
    try {
      window.localStorage.removeItem(SIGNED_UP_STORAGE_KEY);
    } catch {
      // ignore
    }
    setSubmitted(false);
    setSubmittedEmail(null);
    setEmail("");
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <PageBackdrop />
      <SiteNav />
      <main className="mx-auto grid max-w-6xl gap-12 px-4 pt-32 pb-20 md:grid-cols-2 md:items-center">
        {/* Left: copy */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-xs uppercase tracking-[0.2em] text-accent">
            Private beta · 2026
          </span>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Memories deserve better than{" "}
            <span className="text-gradient">being forgotten.</span>
          </h1>
          <p className="mt-5 max-w-md text-muted-foreground">
            Join the waitlist for EchoVault AI — the privacy-first emotional
            memory companion. We're rolling out access slowly, with care.
          </p>

          <ul className="mt-8 space-y-4">
            {perks.map((p, i) => (
              <motion.li
                key={p.title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="flex items-start gap-3"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-accent shadow-[var(--shadow-emerald)]">
                  <p.icon className="h-4 w-4 text-background" />
                </div>
                <div>
                  <p className="text-sm font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Right: form card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="glass glow-border relative overflow-hidden rounded-3xl p-8 shadow-[var(--shadow-card)]">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-violet/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5 text-accent" /> Your email is never
                shared
              </div>
              <h2 className="mt-3 text-2xl font-semibold">Reserve your place</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                A single email. No spam. Just one launch note when access opens.
              </p>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="mt-6 space-y-3" noValidate>
                  <div className="space-y-1.5">
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      aria-invalid={!emailIsValid}
                      aria-describedby={
                        !emailIsValid
                          ? "waitlist-email-error"
                          : error
                            ? "waitlist-form-error"
                            : undefined
                      }
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="you@memory.ai"
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-border bg-background/40 px-4 py-3.5 text-sm outline-none transition focus:border-accent/50 focus:bg-background/70 placeholder:text-muted-foreground disabled:opacity-60 aria-[invalid=true]:border-destructive/60"
                    />
                    {!emailIsValid && (
                      <p
                        id="waitlist-email-error"
                        className="px-1 text-[11px] text-destructive"
                      >
                        That doesn't look like a valid email.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 py-3.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        Join the waitlist{" "}
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>

                  {error && (
                    <p
                      id="waitlist-form-error"
                      role="alert"
                      className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
                    >
                      {error}
                    </p>
                  )}

                  <p className="pt-1 text-center text-[11px] text-muted-foreground">
                    By joining, you agree to our privacy-first principles.
                  </p>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 rounded-2xl border border-accent/30 bg-accent/5 p-6 text-center"
                >
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gradient-accent shadow-[var(--shadow-emerald)]">
                    <CheckCircle2 className="h-6 w-6 text-background" />
                  </div>
                  <h3 className="mt-4 font-semibold">You're on the list.</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {submittedEmail ? (
                      <>
                        We'll reach out at{" "}
                        <span className="text-foreground">{submittedEmail}</span>{" "}
                        when access opens.
                      </>
                    ) : (
                      <>We'll reach out when access opens.</>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={handleResetSignup}
                    className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
                  >
                    Use a different email
                  </button>
                </motion.div>
              )}

              <div className="mt-7 grid grid-cols-2 gap-2 text-center">
                {[
                  { v: "Q3 '26", l: "beta opens" },
                  { v: "100%", l: "user owned" },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="rounded-xl border border-border bg-card/40 p-3"
                  >
                    <div className="text-sm font-semibold">{s.v}</div>
                    <div className="text-[10px] text-muted-foreground">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      <SiteFooter />
    </div>
  );
}
