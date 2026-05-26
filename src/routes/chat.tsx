import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, FileText, Loader2, Lightbulb, Shield } from "lucide-react";
import { SiteNav, SiteFooter, PageBackdrop } from "@/components/site-shell";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Reflect — EchoVault AI" },
      { name: "description", content: "Ask your memory vault — receive grounded, analytical reflections drawn from your own past." },
    ],
  }),
  component: ChatPage,
});

type Msg = {
  role: "user" | "ai";
  content: string;
  citations?: { source: string; confidence: number }[];
};

const seed: Msg[] = [
  {
    role: "user",
    content: "What advice did they usually give me when I was uncertain?",
  },
  {
    role: "ai",
    content:
      "Across conversations from 2021–2023, a consistent pattern emerges: gentle encouragement to slow down, trust your process, and treat patience as a strategy rather than a delay. The tone is steady and grounding, not directive.",
    citations: [
      { source: "WhatsApp · Jun 2021", confidence: 0.94 },
      { source: "Journal · Aug 2022", confidence: 0.88 },
      { source: "Voice note · Mar 2023", confidence: 0.81 },
    ],
  },
];

const suggestions = [
  "What patterns appear during my hardest months?",
  "Summarize my most reflective conversations.",
  "What themes show up in my journal in 2023?",
  "When was I most encouraged?",
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
      Retrieving memories…
    </div>
  );
}

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          content:
            "Looking through your archive, related memories cluster around themes of resilience and slow growth. Responses from that period emphasized small consistent actions over dramatic change.",
          citations: [
            { source: "Journal · Feb 2022", confidence: 0.9 },
            { source: "WhatsApp · Sep 2022", confidence: 0.83 },
          ],
        },
      ]);
      setLoading(false);
    }, 1100);
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <PageBackdrop />
      <SiteNav />
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 pt-28 pb-32">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <span className="text-xs uppercase tracking-[0.2em] text-accent">Reflection · grounded retrieval</span>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Ask your memory vault.</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Responses are analytical and cite real memories from your archive. EchoVault never simulates a person.
          </p>
        </motion.div>

        {/* Ethics banner */}
        <div className="glass glow-border mt-6 flex items-center gap-3 rounded-xl px-4 py-3 text-xs text-muted-foreground">
          <Shield className="h-4 w-4 text-accent" />
          Analytical companion mode · no impersonation · memories cited
        </div>

        {/* Messages */}
        <div className="mt-6 flex-1 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`flex ${m.role === "user" ? "justify-end" : "items-start gap-3"}`}
              >
                {m.role === "ai" && (
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--gradient-accent)] shadow-[var(--shadow-emerald)]">
                    <Sparkles className="h-4 w-4 text-background" />
                  </div>
                )}
                {m.role === "user" ? (
                  <div className="max-w-md rounded-2xl rounded-tr-md bg-[var(--gradient-primary)] px-5 py-3 text-sm text-primary-foreground shadow-[var(--shadow-glow)]">
                    {m.content}
                  </div>
                ) : (
                  <div className="max-w-2xl rounded-2xl rounded-tl-md border border-border bg-card/60 px-5 py-4 text-sm leading-relaxed backdrop-blur">
                    {m.content}
                    {m.citations && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {m.citations.map((c, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 rounded-md border border-border bg-background/40 px-2 py-1 text-[10px] text-muted-foreground">
                            <FileText className="h-2.5 w-2.5" /> {c.source}
                            <span className="text-accent">· {Math.round(c.confidence * 100)}%</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--gradient-accent)]">
                <Sparkles className="h-4 w-4 text-background" />
              </div>
              <div className="rounded-2xl rounded-tl-md border border-border bg-card/60 px-5 py-3 backdrop-blur">
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 2 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-accent/40 hover:text-foreground"
              >
                <Lightbulb className="h-3 w-3 text-accent" /> {s}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Composer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/80 backdrop-blur">
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-3"
        >
          <div className="glass glow-border flex flex-1 items-center gap-2 rounded-2xl px-4 py-2.5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a theme, a year, or a feeling…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-105 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
      <SiteFooter />
    </div>
  );
}
