import { motion } from "framer-motion";
import {
  Shield, Database, Trash2, UserCheck, Upload, Brain, Search, MessageCircle,
  MessageSquare, Activity, Vault, Sparkles, BarChart3, Mic, Heart, BookOpen,
  Layers, Github, Linkedin, ArrowRight, ArrowUpRight, Cpu, Eye, Check, Lock,
} from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EchoVault AI — Ethical memory intelligence" },
      { name: "description", content: "Privacy-first emotional memory companion. EchoVault AI transforms conversations, journals, and voice notes into a secure, searchable memory system." },
      { property: "og:title", content: "EchoVault AI — Ethical memory intelligence" },
      { property: "og:description", content: "A reflective, privacy-first AI companion for preserving and exploring your memories — ethically." },
    ],
  }),
  component: Index,
});

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const } }),
};

/* ─────────────────────────  HERO  ───────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-28 md:pt-44 md:pb-36">
      {/* faint cobalt halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[640px] w-[1100px] -translate-x-1/2 opacity-60 blur-3xl"
        style={{ background: "radial-gradient(closest-side, oklch(0.85 0.12 264 / 0.22), transparent 70%)" }}
      />
      <div className="mx-auto max-w-4xl px-6 text-center">
        <motion.a
          href="#features"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-[13px] text-zinc-600 transition hover:border-zinc-300"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.52_0.22_264)]" />
          Building the future of ethical memory retrieval
          <ArrowRight className="h-3 w-3" />
        </motion.a>

        <motion.h1
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }}
          className="mt-7 text-balance text-5xl font-semibold tracking-[-0.03em] text-zinc-950 md:text-6xl lg:text-7xl"
        >
          Preserving memories through{" "}
          <span className="text-zinc-500">ethical AI.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.12 }}
          className="mx-auto mt-6 max-w-2xl text-pretty text-[17px] leading-relaxed text-zinc-500"
        >
          EchoVault transforms historical conversations, journals, and voice notes into a secure,
          searchable emotional memory system. No deepfakes. No hallucinations. Just your memories, preserved.
        </motion.p>

        <motion.form
          onSubmit={(e) => e.preventDefault()}
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto mt-10 flex max-w-md flex-col gap-2 sm:flex-row"
        >
          <input
            type="email"
            required
            placeholder="you@email.com"
            className="h-11 flex-1 rounded-lg border border-zinc-200 bg-white px-4 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
          />
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-5 text-sm font-medium text-zinc-50 transition hover:bg-zinc-800"
          >
            Join the waitlist <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-zinc-500"
        >
          <Lock className="h-3 w-3" />
          Privacy-first RAG architecture · You own 100% of your data
        </motion.p>

        {/* secondary actions */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-zinc-500"
        >
          <Link to="/dashboard" className="inline-flex items-center gap-1 hover:text-zinc-900">
            Enter EchoVault <ArrowUpRight className="h-3 w-3" />
          </Link>
          <span className="h-3 w-px bg-zinc-200" />
          <a href="#architecture" className="inline-flex items-center gap-1 hover:text-zinc-900">
            Explore architecture <ArrowUpRight className="h-3 w-3" />
          </a>
          <span className="h-3 w-px bg-zinc-200" />
          <a href="https://github.com/miashraf1818" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-zinc-900">
            View on GitHub <ArrowUpRight className="h-3 w-3" />
          </a>
        </motion.div>
      </div>

      {/* Memory preview card — calm, no float */}
      <div className="mx-auto mt-24 max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_0_oklch(0_0_0/0.04),0_24px_60px_-30px_oklch(0_0_0/0.18)] md:p-8"
        >
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: MessageSquare, label: "Conversation · 2021", text: "\"You'll figure it out — you always do. Just give it time.\"" },
              { icon: BookOpen, label: "Journal · Spring 2022", text: "\"Today felt heavy, but I noticed small wins again.\"" },
              { icon: Mic, label: "Voice note · Aug 2023", text: "\"Reminder: trust the long arc. Patience is a strategy.\"" },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-5">
                <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-wider text-zinc-500">
                  <c.icon className="h-3 w-3" /> {c.label}
                </div>
                <p className="text-[15px] leading-relaxed text-zinc-800">{c.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────  SECTIONS  ───────────────────────── */

const trust = [
  { icon: Shield, title: "Privacy first", desc: "Your memories never leave your private namespace." },
  { icon: Lock, title: "End-to-end encryption", desc: "AES-256 at rest. TLS in transit. Always." },
  { icon: UserCheck, title: "User-owned memories", desc: "You retain full control of every fragment." },
  { icon: Eye, title: "Not a human simulation", desc: "An analytical companion — never a clone." },
  { icon: Trash2, title: "Right to delete", desc: "One click. Permanent. No recovery shadows." },
];

function SectionHeader({ kicker, title, sub }: { kicker?: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {kicker && <span className="text-[12px] font-medium uppercase tracking-[0.16em] text-zinc-500">{kicker}</span>}
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 md:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-[16px] leading-relaxed text-zinc-500">{sub}</p>}
    </div>
  );
}

function Trust() {
  return (
    <section className="border-t border-zinc-200 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader kicker="Principles" title="Built on principles, not promises." sub="Five ethical commitments that shape every layer of the system." />
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 sm:grid-cols-2 lg:grid-cols-5">
          {trust.map((t, i) => (
            <motion.div key={t.title} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} custom={i} className="bg-white p-6 transition hover:bg-zinc-50">
              <t.icon className="h-4 w-4 text-zinc-900" strokeWidth={1.75} />
              <h3 className="mt-4 text-sm font-semibold text-zinc-950">{t.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { icon: Upload, title: "Upload memories", desc: "Drop WhatsApp exports, journals, voice notes — fully private ingestion." },
  { icon: Brain, title: "AI organizes patterns", desc: "Emotional, temporal, and semantic embeddings shape your vault." },
  { icon: Search, title: "Semantic retrieval", desc: "Top-K vector search with emotional and temporal re-ranking." },
  { icon: MessageCircle, title: "Reflect safely", desc: "Grounded responses cite real memories — no fabrication." },
];

function HowItWorks() {
  return (
    <section id="how" className="border-t border-zinc-200 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader kicker="How it works" title="From raw memory to grounded reflection." />
        <div className="mt-16 grid gap-6 md:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div key={s.title} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} custom={i} className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <s.icon className="h-4 w-4 text-zinc-900" strokeWidth={1.75} />
                <span className="font-mono text-[11px] text-zinc-400">0{i + 1}</span>
              </div>
              <h3 className="mt-5 text-sm font-semibold text-zinc-950">{s.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: MessageSquare, title: "WhatsApp chat import", desc: "Drop .txt exports — temporal chunking handles years of context." },
  { icon: Activity, title: "Emotional timeline", desc: "Visualize emotional patterns across years of conversations." },
  { icon: Search, title: "AI memory search", desc: "Vector search with emotional, temporal, and metadata re-ranking." },
  { icon: Vault, title: "Secure vault", desc: "Per-user namespace isolation in Qdrant. RLS in Postgres." },
  { icon: Sparkles, title: "Contextual reflection", desc: "Grounded analytical responses, citing real memory fragments." },
  { icon: BarChart3, title: "Memory analytics", desc: "Emotion, topic, speaker, and continuity metrics over time." },
];

function Features() {
  return (
    <section id="features" className="border-t border-zinc-200 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader kicker="MVP capabilities" title="Everything your memory deserves." />
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div key={f.title} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} custom={i % 3} className="bg-white p-7 transition hover:bg-zinc-50">
              <f.icon className="h-4 w-4 text-zinc-900" strokeWidth={1.75} />
              <h3 className="mt-5 text-sm font-semibold text-zinc-950">{f.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const archNodes = [
  { label: "User", icon: UserCheck },
  { label: "Upload", icon: Upload },
  { label: "Embeddings", icon: Layers },
  { label: "Vector DB", icon: Database },
  { label: "Retrieval", icon: Search },
  { label: "LLM", icon: Cpu },
  { label: "Response", icon: MessageCircle },
];

function Architecture() {
  return (
    <section id="architecture" className="border-t border-zinc-200 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader kicker="Architecture" title="An ethical RAG pipeline, end to end." />

        <div className="mt-14 rounded-2xl border border-zinc-200 bg-white p-6 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {archNodes.map((n, i) => (
              <div key={n.label} className="flex items-center gap-3">
                <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="flex flex-col items-center gap-2">
                  <div className="grid h-12 w-12 place-items-center rounded-xl border border-zinc-200 bg-zinc-50">
                    <n.icon className="h-4 w-4 text-zinc-900" strokeWidth={1.75} />
                  </div>
                  <span className="text-[11px] text-zinc-500">{n.label}</span>
                </motion.div>
                {i < archNodes.length - 1 && (
                  <ArrowRight className="hidden h-3.5 w-3.5 text-zinc-300 md:block" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {["FastAPI", "LangChain", "Qdrant", "HuggingFace", "Groq", "LLaMA-3"].map((t) => (
              <div key={t} className="rounded-lg border border-zinc-200 bg-zinc-50/60 px-4 py-3 text-center text-[13px] text-zinc-700">
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SampleChat() {
  return (
    <section className="border-t border-zinc-200 py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeader kicker="Reflection, not simulation" title="A sample memory interaction." />
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-12 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 md:p-8"
        >
          <div className="flex justify-end">
            <div className="max-w-md rounded-2xl rounded-tr-md bg-zinc-900 px-5 py-3 text-sm text-zinc-50">
              I'm stressed about my future.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-white">
              <Sparkles className="h-3.5 w-3.5 text-zinc-900" strokeWidth={1.75} />
            </div>
            <div className="max-w-lg rounded-2xl rounded-tl-md border border-zinc-200 bg-zinc-50/60 px-5 py-3.5 text-sm leading-relaxed text-zinc-800">
              Looking through conversations from 2021, they often encouraged you to trust your growth during uncertain times.
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] text-zinc-500">
                <span className="rounded-md border border-zinc-200 bg-white px-2 py-1">Memory · WhatsApp · Jun 2021</span>
                <span className="rounded-md border border-zinc-200 bg-white px-2 py-1">Memory · Journal · Aug 2022</span>
                <span className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-[oklch(0.52_0.22_264)]">Confidence 0.92</span>
              </div>
            </div>
          </div>
          <p className="pt-2 text-center text-[12px] text-zinc-400">Responses are analytical and grounded — never personified.</p>
        </motion.div>
      </div>
    </section>
  );
}

const comingSoon = [
  { icon: Mic, title: "Voice memory reconstruction", tag: "Research preview" },
  { icon: Heart, title: "Emotional relationship timelines", tag: "Beta" },
  { icon: BookOpen, title: "AI memory journaling", tag: "Beta" },
  { icon: Search, title: "Semantic voice search", tag: "Experimental" },
  { icon: Layers, title: "Multi-modal memory retrieval", tag: "Research preview" },
  { icon: Vault, title: "Family memory archives", tag: "Privacy first" },
  { icon: Sparkles, title: "AI reflection companion", tag: "Beta" },
  { icon: BarChart3, title: "Personal emotional analytics", tag: "Experimental" },
];

function ComingSoon() {
  return (
    <section className="border-t border-zinc-200 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          kicker="On the horizon"
          title="The future of memory intelligence."
          sub="Building the next generation of ethical emotional AI — focused on reflection, memory preservation, and human-centered intelligence."
        />
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 sm:grid-cols-2 lg:grid-cols-4">
          {comingSoon.map((f, i) => (
            <motion.div key={f.title} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} custom={i % 4} className="bg-white p-6 transition hover:bg-zinc-50">
              <div className="flex items-start justify-between gap-3">
                <f.icon className="h-4 w-4 text-zinc-900" strokeWidth={1.75} />
                <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                  {f.tag}
                </span>
              </div>
              <h3 className="mt-5 text-sm font-semibold text-zinc-950">{f.title}</h3>
              <p className="mt-1 text-[12px] text-zinc-400">Coming soon</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Founder() {
  return (
    <section className="border-t border-zinc-200 py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-2xl border border-zinc-200 bg-white p-8 md:p-12"
        >
          <div className="grid items-center gap-10 md:grid-cols-[auto_1fr]">
            <div className="mx-auto md:mx-0">
              <div className="h-24 w-24 overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 shadow-[var(--shadow-glow)]">
                <img
                  src="/founder.jpg"
                  alt="Mohammed Ikram Ashrafi"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="text-center md:text-left">
              <span className="text-[12px] font-medium uppercase tracking-[0.16em] text-zinc-500">Founder</span>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 md:text-4xl">A companion, not a clone.</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-zinc-500">
                EchoVault AI was created to explore how artificial intelligence can preserve emotional context,
                memories, and human communication patterns — without crossing ethical boundaries.
              </p>
              <div className="mt-5">
                <p className="text-sm font-semibold text-zinc-950">Mohammed Ikram Ashrafi</p>
                <p className="text-[13px] text-zinc-500">AI systems & backend engineer — RAG architectures, FastAPI systems, scalable AI infrastructure, emotional intelligence systems.</p>
              </div>

              <ul className="mt-5 grid gap-1.5 text-[13px] text-zinc-600 md:grid-cols-2">
                {["RAG architectures", "FastAPI systems", "Scalable AI infrastructure", "Emotional intelligence systems"].map((s) => (
                  <li key={s} className="inline-flex items-center gap-2"><Check className="h-3 w-3 text-[oklch(0.52_0.22_264)]" /> {s}</li>
                ))}
              </ul>

              <div className="mt-7 flex flex-wrap justify-center gap-2 md:justify-start">
                <a href="https://www.mohammed-ikram-ashrafi.in/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-[13px] font-medium text-zinc-50 transition hover:bg-zinc-800">
                  View portfolio <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <a href="https://github.com/miashraf1818" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-[13px] text-zinc-900 transition hover:bg-zinc-50">
                  <Github className="h-3.5 w-3.5" /> GitHub
                </a>
                <a href="https://www.linkedin.com/in/mohammed-ikram-ashrafi/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-[13px] text-zinc-900 transition hover:bg-zinc-50">
                  <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function WaitlistCTA() {
  return (
    <section id="waitlist" className="border-t border-zinc-200 py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-balance text-4xl font-semibold tracking-[-0.03em] text-zinc-950 md:text-5xl">
          Memories deserve better than <span className="text-zinc-500">being forgotten.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-zinc-500">
          Join the waitlist and help shape the future of ethical memory intelligence.
        </p>
        <form onSubmit={(e) => e.preventDefault()} className="mx-auto mt-10 flex max-w-md flex-col gap-2 sm:flex-row">
          <input
            type="email"
            required
            placeholder="you@email.com"
            className="h-11 flex-1 rounded-lg border border-zinc-200 bg-white px-4 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
          />
          <button className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-5 text-sm font-medium text-zinc-50 transition hover:bg-zinc-800">
            Join the waitlist <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>
        <p className="mt-4 text-[13px] text-zinc-500">No spam, ever. One launch note when access opens.</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200 py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-zinc-900">
                <span className="h-1.5 w-1.5 rounded-[2px] bg-white" />
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-zinc-950">EchoVault <span className="font-normal text-zinc-500">AI</span></span>
            </div>
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-zinc-500">
              Privacy-first AI architecture. Built using open-source intelligence. Designed for reflection, not simulation.
            </p>
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-zinc-950">Product</h4>
            <ul className="mt-3 space-y-2 text-[13px] text-zinc-500">
              <li><a href="#features" className="hover:text-zinc-900">Features</a></li>
              <li><a href="#architecture" className="hover:text-zinc-900">Architecture</a></li>
              <li><a href="#waitlist" className="hover:text-zinc-900">Waitlist</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-zinc-950">Principles</h4>
            <ul className="mt-3 space-y-2 text-[13px] text-zinc-500">
              <li>Privacy</li>
              <li>Ethics</li>
              <li>Right to delete</li>
            </ul>
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-zinc-950">Connect</h4>
            <div className="mt-3 flex gap-2">
              <a href="https://github.com/miashraf1818" target="_blank" rel="noreferrer" aria-label="GitHub" className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-900 transition hover:bg-zinc-50"><Github className="h-3.5 w-3.5" /></a>
              <a href="https://www.linkedin.com/in/mohammed-ikram-ashrafi/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-900 transition hover:bg-zinc-50"><Linkedin className="h-3.5 w-3.5" /></a>
              <a href="https://www.mohammed-ikram-ashrafi.in/" target="_blank" rel="noreferrer" aria-label="Portfolio" className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-900 transition hover:bg-zinc-50"><Sparkles className="h-3.5 w-3.5" /></a>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-zinc-200 pt-6 text-[12px] text-zinc-500 md:flex-row">
          <p>© 2026 EchoVault AI — designed & engineered by Mohammed Ikram Ashrafi</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-zinc-900">Privacy</a>
            <a href="#" className="hover:text-zinc-900">Ethics</a>
            <a href="#" className="hover:text-zinc-900">Architecture</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function TryDemoCTA() {
  return (
    <section className="border-t border-zinc-200 py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 sm:p-10 md:p-14"
        >
          {/* Subtle cobalt halo */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, oklch(0.85 0.12 264 / 0.35), transparent 70%)",
            }}
          />
          <div className="relative grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-center">
            <div className="text-center md:text-left">
              <span className="text-[12px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                See it in action
              </span>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-zinc-950 md:text-4xl">
                Try the live demo.
              </h2>
              <p className="mt-4 text-pretty text-[15px] leading-relaxed text-zinc-500 md:text-[16px]">
                Watch the EchoVault pipeline run end-to-end on synthetic sample
                data, or upload your own WhatsApp export. Real chunks, real
                citations, no signup.
              </p>

              <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:items-stretch md:items-start md:justify-start">
                <Link
                  to="/demo"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-5 py-3 text-[14px] font-medium text-zinc-50 transition hover:bg-zinc-800 sm:w-auto"
                >
                  Try the demo <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-5 py-3 text-[14px] font-medium text-zinc-900 transition hover:bg-zinc-50 sm:w-auto"
                >
                  Enter the vault <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <ul className="mt-7 grid gap-y-2 text-[13px] text-zinc-600 sm:grid-cols-2">
                {[
                  "Live Temporal Emotional RAG",
                  "13 seeded memory chunks",
                  "Grounded, cited reflections",
                  "Ephemeral 1-hour sessions",
                ].map((s) => (
                  <li
                    key={s}
                    className="inline-flex items-center justify-center gap-2 sm:justify-start"
                  >
                    <Check className="h-3 w-3 text-[oklch(0.52_0.22_264)]" /> {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual stack — collapses to a tighter mobile preview */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-5">
                  <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-wider text-zinc-500">
                    <Sparkles className="h-3 w-3" /> Reflective · Mar 2024
                  </div>
                  <p className="text-[14px] leading-relaxed text-zinc-800">
                    "Doubt is part of growing — across these messages, your
                    growth has come from sitting with uncertainty, not running
                    from it."
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] text-zinc-500">
                    <span className="rounded-md border border-zinc-200 bg-white px-2 py-1">
                      WhatsApp · 92%
                    </span>
                    <span className="rounded-md border border-zinc-200 bg-white px-2 py-1">
                      Journal · 81%
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-3 -right-3 -z-10 h-full w-full rounded-xl border border-zinc-200 bg-zinc-100" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <Hero />
        <Trust />
        <Founder />
        <TryDemoCTA />
        <HowItWorks />
        <Features />
        <Architecture />
        <SampleChat />
        <ComingSoon />
        <WaitlistCTA />
      </main>
      <Footer />
    </div>
  );
}
