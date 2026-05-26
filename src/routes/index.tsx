import { motion } from "framer-motion";
import {
  Lock, Shield, Database, Trash2, UserCheck, Upload, Brain, Search, MessageCircle,
  MessageSquare, Activity, Vault, Sparkles, BarChart3, Mic, Heart, BookOpen,
  Network, Layers, FileText, Github, Linkedin, Twitter, ArrowRight, Cpu, Zap, Eye,
} from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-shell";
import { Hero3D } from "@/components/hero-3d";
import { AmbientParticles } from "@/components/ambient-particles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EchoVault AI — Ethical Memory Intelligence" },
      { name: "description", content: "Privacy-first emotional memory companion. EchoVault AI transforms conversations, journals, and voice notes into a secure RAG-powered memory system." },
      { property: "og:title", content: "EchoVault AI — Ethical Memory Intelligence" },
      { property: "og:description", content: "A reflective, privacy-first AI companion for preserving and exploring your memories — ethically." },
    ],
  }),
  component: Index,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const } }),
};

function GradientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full bg-violet/30 blur-[140px] animate-glow" />
      <div className="absolute top-1/3 -right-32 h-[480px] w-[480px] rounded-full bg-indigo/30 blur-[160px] animate-glow" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-emerald/20 blur-[140px] animate-glow" style={{ animationDelay: "2s" }} />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
    </div>
  );
}

function FloatingCard({ className, children, delay = 0 }: { className?: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className={`glass rounded-2xl p-4 shadow-[var(--shadow-card)] animate-float ${className ?? ""}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </motion.div>
  );
}


function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-40 pb-24 md:pt-48 md:pb-32">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <GradientBackdrop />
      <AmbientParticles density={42} />
      <Hero3D />
      <div className="relative mx-auto max-w-6xl px-4">

        <motion.div initial="hidden" animate="show" className="mx-auto max-w-3xl text-center">
          <motion.div variants={fadeUp} className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Privacy-First Emotional RAG System
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="text-balance text-4xl font-semibold tracking-tight md:text-6xl lg:text-7xl">
            Preserving memories through{" "}
            <span className="text-gradient">ethical intelligence.</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="mx-auto mt-6 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
            EchoVault AI transforms conversations, voice notes, and journals into a secure
            emotional memory system powered by AI — as a companion, not a clone.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/dashboard" className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-background shadow-[var(--shadow-glow)] transition hover:scale-[1.03] hover:bg-primary/90">
              Enter EchoVault <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <a href="#architecture" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-6 py-3 text-sm font-medium text-foreground backdrop-blur transition hover:bg-card">
              Explore Architecture
            </a>
            <Link to="/waitlist" className="inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-6 py-3 text-sm font-medium text-accent backdrop-blur transition hover:bg-accent/20">
              Join Waitlist
            </Link>
          </motion.div>

          {/* Trust signal strip */}
          <motion.div
            variants={fadeUp}
            custom={4}
            className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80"
          >
            <span className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-primary" /> End-to-End Encrypted</span>
            <span className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-accent" /> Ethical AI</span>
            <span className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-emerald" /> User-Owned Data</span>
            <span className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-indigo" /> Grounded Reflections</span>
            <span className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-violet" /> No Human Simulation</span>
          </motion.div>
        </motion.div>

        {/* Floating memory preview */}
        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="glass glow-border rounded-3xl p-6 shadow-[var(--shadow-card)] md:p-10">
            <div className="grid gap-5 md:grid-cols-3">
              <FloatingCard delay={0}>
                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground"><MessageSquare className="h-3.5 w-3.5 text-violet" /> Conversation · 2021</div>
                <p className="text-sm leading-relaxed text-foreground/90">"You'll figure it out — you always do. Just give it time."</p>
              </FloatingCard>
              <FloatingCard delay={0.6}>
                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground"><BookOpen className="h-3.5 w-3.5 text-accent" /> Journal · Spring 2022</div>
                <p className="text-sm leading-relaxed text-foreground/90">"Today felt heavy, but I noticed small wins again."</p>
              </FloatingCard>
              <FloatingCard delay={1.2}>
                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground"><Mic className="h-3.5 w-3.5 text-indigo" /> Voice note · Aug 2023</div>
                <p className="text-sm leading-relaxed text-foreground/90">"Reminder: trust the long arc. Patience is a strategy."</p>
              </FloatingCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const trust = [
  { icon: Shield, title: "Privacy First", desc: "Your memories never leave your private namespace." },
  { icon: Lock, title: "End-to-End Encryption", desc: "AES-256 at rest. TLS in transit. Always." },
  { icon: UserCheck, title: "User-Owned Memories", desc: "You retain full control of every fragment." },
  { icon: Eye, title: "Not a Human Simulation", desc: "An analytical companion — never a clone." },
  { icon: Trash2, title: "Right to Delete Everything", desc: "One click. Permanent. No recovery shadows." },
];

function Trust() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Built on principles, not promises.</h2>
          <p className="mt-3 text-muted-foreground">Five ethical commitments that shape every layer of the system.</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {trust.map((t, i) => (
            <motion.div key={t.title} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} custom={i} className="glass glow-border group rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]">
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-gradient-accent">
                <t.icon className="h-5 w-5 text-background" />
              </div>
              <h3 className="text-sm font-semibold">{t.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{t.desc}</p>
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
    <section id="how" className="relative py-24 md:py-32">
      <GradientBackdrop />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.2em] text-accent">How it works</span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">From raw memory to grounded reflection.</h2>
        </div>
        <div className="relative mt-16 grid gap-6 md:grid-cols-4">
          <div className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />
          {steps.map((s, i) => (
            <motion.div key={s.title} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} custom={i} className="relative">
              <div className="glass glow-border rounded-2xl p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary shadow-[var(--shadow-glow)]">
                    <s.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                </div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: MessageSquare, title: "WhatsApp Chat Import", desc: "Drop .txt exports — temporal chunking handles years of context." },
  { icon: Activity, title: "Emotional Timeline", desc: "Visualize emotional patterns across years of conversations." },
  { icon: Search, title: "AI Memory Search", desc: "Vector search with emotional, temporal, and metadata re-ranking." },
  { icon: Vault, title: "Secure Vault", desc: "Per-user namespace isolation in Qdrant. RLS in Postgres." },
  { icon: Sparkles, title: "Contextual Reflection", desc: "Grounded analytical responses, citing real memory fragments." },
  { icon: BarChart3, title: "Memory Analytics", desc: "Emotion, topic, speaker, and continuity metrics over time." },
];

function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.2em] text-accent">MVP capabilities</span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Everything your memory deserves.</h2>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div key={f.title} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} custom={i % 3} className="glass glow-border group relative overflow-hidden rounded-2xl p-7 transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet/20 blur-3xl opacity-0 transition group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-gradient-accent">
                  <f.icon className="h-5 w-5 text-background" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
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
    <section id="architecture" className="relative py-24 md:py-32">
      <GradientBackdrop />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.2em] text-accent">Architecture</span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">An ethical RAG pipeline, end to end.</h2>
        </div>

        <div className="glass glow-border mt-14 rounded-3xl p-6 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {archNodes.map((n, i) => (
              <div key={n.label} className="flex items-center gap-3">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex flex-col items-center gap-2">
                  <div className="grid h-12 w-12 place-items-center rounded-xl border border-border bg-card/60 backdrop-blur shadow-[var(--shadow-card)]">
                    <n.icon className="h-5 w-5 text-violet" />
                  </div>
                  <span className="text-xs text-muted-foreground">{n.label}</span>
                </motion.div>
                {i < archNodes.length - 1 && (
                  <ArrowRight className="hidden h-4 w-4 text-muted-foreground/50 md:block" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {["FastAPI", "LangChain", "Qdrant", "HuggingFace", "Groq", "LLaMA-3"].map((t) => (
              <div key={t} className="rounded-xl border border-border bg-card/40 px-4 py-3 text-center text-sm backdrop-blur">
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
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.2em] text-accent">Reflection, not simulation</span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">A sample memory interaction.</h2>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass glow-border mt-12 space-y-4 rounded-3xl p-6 md:p-8">
          <div className="flex justify-end">
            <div className="max-w-md rounded-2xl rounded-tr-md bg-gradient-primary px-5 py-3 text-sm text-primary-foreground shadow-[var(--shadow-glow)]">
              I'm stressed about my future.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-accent">
              <Sparkles className="h-4 w-4 text-background" />
            </div>
            <div className="max-w-lg rounded-2xl rounded-tl-md border border-border bg-card/60 px-5 py-3.5 text-sm leading-relaxed backdrop-blur">
              Looking through conversations from 2021, they often encouraged you to trust your growth during uncertain times.
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                <span className="rounded-md border border-border bg-background/40 px-2 py-1">Memory · WhatsApp · Jun 2021</span>
                <span className="rounded-md border border-border bg-background/40 px-2 py-1">Memory · Journal · Aug 2022</span>
                <span className="rounded-md border border-border bg-background/40 px-2 py-1">Confidence 0.92</span>
              </div>
            </div>
          </div>
          <p className="pt-2 text-center text-xs text-muted-foreground">Responses are analytical and grounded — never personified.</p>
        </motion.div>
      </div>
    </section>
  );
}

const comingSoon = [
  { icon: Mic, title: "Voice Memory Reconstruction", tag: "Research Preview" },
  { icon: Heart, title: "Emotional Relationship Timelines", tag: "Beta" },
  { icon: BookOpen, title: "AI Memory Journaling", tag: "Beta" },
  { icon: Search, title: "Semantic Voice Search", tag: "Experimental" },
  { icon: Layers, title: "Multi-modal Memory Retrieval", tag: "Research Preview" },
  { icon: Vault, title: "Family Memory Archives", tag: "Privacy First" },
  { icon: Sparkles, title: "AI Reflection Companion", tag: "Beta" },
  { icon: BarChart3, title: "Personal Emotional Analytics", tag: "Experimental" },
];

function ComingSoon() {
  return (
    <section className="relative py-24 md:py-32">
      <GradientBackdrop />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.2em] text-accent">On the horizon</span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">The Future of Memory Intelligence</h2>
          <p className="mt-4 text-muted-foreground">
            We are building the next generation of ethical emotional AI — focused on reflection,
            memory preservation, and human-centered intelligence.
          </p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {comingSoon.map((f, i) => (
            <motion.div key={f.title} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} custom={i % 4} className="glass glow-border group relative overflow-hidden rounded-2xl p-6 transition hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-accent opacity-0 blur-2xl transition group-hover:opacity-20" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card/60">
                    <f.icon className="h-4.5 w-4.5 text-violet" />
                  </div>
                  <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-accent">
                    {f.tag}
                  </span>
                </div>
                <h3 className="mt-5 text-sm font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground">Coming Soon</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Founder() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass glow-border relative overflow-hidden rounded-3xl p-8 md:p-12">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-violet/20 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-[auto_1fr]">
            <div className="relative mx-auto md:mx-0">
              <div className="absolute -inset-2 rounded-full bg-gradient-accent opacity-60 blur-xl" />
              <div className="relative grid h-28 w-28 place-items-center rounded-full bg-gradient-primary text-3xl font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">
                MI
              </div>
            </div>
            <div className="text-center md:text-left">
              <span className="text-xs uppercase tracking-[0.2em] text-accent">Built with purpose</span>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">A companion, not a clone.</h2>
              <p className="mt-4 text-muted-foreground">
                EchoVault AI was created to explore how artificial intelligence can preserve emotional context,
                memories, and human communication patterns — without crossing ethical boundaries.
              </p>
              <div className="mt-5">
                <p className="font-semibold">Built by Mohammed Ikram Ashrafi</p>
                <p className="text-sm text-muted-foreground">AI systems & backend engineer — RAG architectures, FastAPI systems, scalable AI infrastructure, emotional intelligence systems.</p>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
                <a href="https://www.mohammed-ikram-ashrafi.in/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-background shadow-[var(--shadow-glow)] transition hover:scale-[1.03] hover:bg-primary/90">
                  <Sparkles className="h-4 w-4" /> View Portfolio
                </a>
                <a href="https://github.com/miashraf1818" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2 text-sm text-foreground backdrop-blur transition hover:bg-card">
                  <Github className="h-4 w-4" /> GitHub
                </a>
                <a href="https://www.linkedin.com/in/mohammed-ikram-ashrafi/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2 text-sm text-foreground backdrop-blur transition hover:bg-card">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Waitlist() {
  return (
    <section id="waitlist" className="relative py-24 md:py-32">
      <GradientBackdrop />
      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
          Memories deserve better than{" "}
          <span className="text-gradient">being forgotten.</span>
        </motion.h2>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          Join the waitlist and help shape the future of ethical memory intelligence.
        </p>
        <form onSubmit={(e) => e.preventDefault()} className="glass glow-border mx-auto mt-10 flex max-w-lg flex-col gap-2 rounded-2xl p-2 sm:flex-row">
          <input
            type="email"
            required
            placeholder="you@memory.ai"
            className="flex-1 rounded-xl bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-background shadow-[var(--shadow-glow)] transition hover:scale-[1.02] hover:bg-primary/90">
            Join Waitlist <ArrowRight className="h-4 w-4" />
          </button>
        </form>
        <div className="mt-6 flex justify-center gap-3">
          <a href="#architecture" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/40 px-5 py-2.5 text-sm backdrop-blur transition hover:bg-card/70">
            Explore Architecture
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-border py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-accent">
                <Lock className="h-4 w-4 text-background" />
              </div>
              <span className="font-semibold">EchoVault <span className="text-gradient">AI</span></span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Privacy-first AI architecture. Built using open-source intelligence. Designed for reflection, not simulation.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground">Features</a></li>
              <li><a href="#architecture" className="hover:text-foreground">Architecture</a></li>
              <li><a href="#waitlist" className="hover:text-foreground">Waitlist</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Principles</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground">Ethics</a></li>
              <li><a href="#" className="hover:text-foreground">Right to Delete</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Connect</h4>
            <div className="mt-3 flex gap-2">
              <a href="https://github.com/miashraf1818" target="_blank" rel="noreferrer" aria-label="GitHub" className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card/40 text-foreground transition hover:bg-card"><Github className="h-4 w-4" /></a>
              <a href="https://www.linkedin.com/in/mohammed-ikram-ashrafi/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card/40 text-foreground transition hover:bg-card"><Linkedin className="h-4 w-4" /></a>
              <a href="https://www.mohammed-ikram-ashrafi.in/" target="_blank" rel="noreferrer" aria-label="Portfolio" className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card/40 text-foreground transition hover:bg-card"><Sparkles className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row">
          <p>© 2026 EchoVault AI · Designed & Engineered by Mohammed Ikram Ashrafi</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Ethics</a>
            <a href="#" className="hover:text-foreground">Architecture</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <Hero />
        <Trust />
        <HowItWorks />
        <Features />
        <Architecture />
        <SampleChat />
        <ComingSoon />
        <Founder />
        <Waitlist />
      </main>
      <Footer />
    </div>
  );
}
