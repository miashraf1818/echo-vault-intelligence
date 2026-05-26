import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Upload, Search, Sparkles, Activity, Heart, TrendingUp, MessageSquare,
  Mic, BookOpen, FileText, Plus, ArrowUpRight, Filter, Brain, Calendar,
} from "lucide-react";
import { SiteNav, SiteFooter, PageBackdrop } from "@/components/site-shell";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — EchoVault AI" },
      { name: "description", content: "Your private memory vault — upload, reflect, search, and visualize emotional patterns." },
    ],
  }),
  component: Dashboard,
});

const stats = [
  { label: "Memories indexed", value: "12,438", delta: "+312 this week", icon: Brain, tone: "violet" },
  { label: "Emotional balance", value: "Reflective", delta: "Calmer than May", icon: Heart, tone: "emerald" },
  { label: "Reflections this month", value: "47", delta: "+18% MoM", icon: Sparkles, tone: "indigo" },
  { label: "Vault size", value: "284 MB", delta: "AES-256 encrypted", icon: Activity, tone: "violet" },
];

const timeline = [
  { date: "Today · 09:24", title: "Voice note ingested", desc: "32 sec · reflective tone · journaling theme", icon: Mic, tag: "Voice" },
  { date: "Yesterday", title: "WhatsApp export processed", desc: "1,204 messages · 3 contacts · 2019–2024", icon: MessageSquare, tag: "Chat" },
  { date: "May 22", title: "Journal entry indexed", desc: "Emotional theme: gratitude, uncertainty", icon: BookOpen, tag: "Journal" },
  { date: "May 19", title: "Reflection asked", desc: "\"What did they say about patience?\"", icon: Sparkles, tag: "Query" },
  { date: "May 17", title: "Memory cluster formed", desc: "12 fragments grouped under 'career'", icon: Brain, tag: "AI" },
];

const recent = [
  { source: "Journal · Apr 2024", text: "Today felt heavy, but I noticed small wins again.", emotion: "Reflective" },
  { source: "WhatsApp · Jun 2021", text: "You'll figure it out — you always do. Just give it time.", emotion: "Encouraging" },
  { source: "Voice note · Aug 2023", text: "Reminder: trust the long arc. Patience is a strategy.", emotion: "Grounded" },
  { source: "Email · Feb 2022", text: "The work matters because you keep showing up.", emotion: "Affirming" },
];

// Sparkline-style emotional waveform — pure SVG
function EmotionWave() {
  const points = [12, 18, 14, 22, 16, 28, 20, 32, 24, 30, 36, 26, 40, 34, 44, 38, 48];
  const max = Math.max(...points);
  const w = 600, h = 140;
  const step = w / (points.length - 1);
  const coords = points.map((p, i) => `${i * step},${h - (p / max) * (h - 10) - 4}`);
  const path = `M${coords.join(" L")}`;
  const area = `${path} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full">
      <defs>
        <linearGradient id="wave" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.7 0.2 290)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="oklch(0.7 0.2 290)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="line" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="oklch(0.7 0.2 300)" />
          <stop offset="100%" stopColor="oklch(0.74 0.16 165)" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#wave)" />
      <path d={path} stroke="url(#line)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {coords.map((c, i) => {
        const [x, y] = c.split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r="2" fill="oklch(0.95 0.02 270)" opacity="0.6" />;
      })}
    </svg>
  );
}

function Dashboard() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <PageBackdrop />
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 pt-32 pb-20">
        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-accent">Your private vault</span>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Memory Dashboard</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">A calm overview of your emotional and conversational memory.</p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2.5 text-sm backdrop-blur transition hover:bg-card">
              <Filter className="h-4 w-4" /> Filters
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-[var(--gradient-primary)] px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.02]">
              <Plus className="h-4 w-4" /> Upload memory
            </button>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass glow-border mt-8 flex items-center gap-3 rounded-2xl px-4 py-3.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search memories semantically — e.g. 'advice about patience'"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <Link to="/chat" className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--gradient-accent)] px-3 py-1.5 text-xs font-medium text-background">
            Reflect <ArrowUpRight className="h-3 w-3" />
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="glass glow-border rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--gradient-accent)]">
                  <s.icon className="h-4 w-4 text-background" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight">{s.value}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{s.delta}</div>
            </motion.div>
          ))}
        </div>

        {/* Emotional waveform + Upload */}
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass glow-border rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Emotional timeline</h3>
                <p className="text-xs text-muted-foreground">Last 12 months · tone-weighted</p>
              </div>
              <div className="flex gap-1 text-[10px] text-muted-foreground">
                <span className="rounded-md border border-border px-2 py-1">3M</span>
                <span className="rounded-md border border-border bg-card/60 px-2 py-1 text-foreground">1Y</span>
                <span className="rounded-md border border-border px-2 py-1">All</span>
              </div>
            </div>
            <div className="mt-4"><EmotionWave /></div>
            <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "oklch(0.7 0.2 300)" }} /> Reflective</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "oklch(0.74 0.16 165)" }} /> Grounded</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "oklch(0.6 0.2 270)" }} /> Encouraging</span>
            </div>
          </motion.div>

          {/* Upload zone */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass glow-border relative overflow-hidden rounded-2xl p-6">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet/20 blur-3xl" />
            <h3 className="text-sm font-semibold">Add to your vault</h3>
            <p className="mt-1 text-xs text-muted-foreground">WhatsApp .txt, journals, voice notes</p>
            <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/40 px-6 py-8 text-center">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)]">
                <Upload className="h-5 w-5 text-primary-foreground" />
              </div>
              <p className="mt-3 text-sm">Drop files here or click to browse</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Encrypted on upload · never shared</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { icon: MessageSquare, label: "WhatsApp" },
                { icon: BookOpen, label: "Journal" },
                { icon: Mic, label: "Voice" },
              ].map((t) => (
                <button key={t.label} className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card/40 py-3 text-[11px] transition hover:bg-card">
                  <t.icon className="h-4 w-4 text-violet" />
                  {t.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Timeline + Recent */}
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass glow-border rounded-2xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Calendar className="h-4 w-4 text-accent" /> Memory activity</h3>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground">View all</a>
            </div>
            <div className="relative space-y-5 pl-6">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
              {timeline.map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="relative">
                  <span className="absolute -left-6 top-1.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-[var(--gradient-accent)] shadow-[var(--shadow-emerald)]" />
                  <div className="flex flex-wrap items-center gap-2">
                    <t.icon className="h-3.5 w-3.5 text-violet" />
                    <p className="text-sm font-medium">{t.title}</p>
                    <span className="rounded-md border border-border bg-background/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">{t.tag}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t.desc}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{t.date}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass glow-border rounded-2xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-accent" /> Recent memories</h3>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground">View all</a>
            </div>
            <div className="space-y-3">
              {recent.map((r, i) => (
                <div key={i} className="group rounded-xl border border-border bg-card/40 p-4 transition hover:border-violet/40 hover:bg-card/70">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5"><FileText className="h-3 w-3" /> {r.source}</span>
                    <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-accent">{r.emotion}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/90">"{r.text}"</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
