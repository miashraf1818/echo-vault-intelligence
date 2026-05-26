import { Link } from "@tanstack/react-router";
import { Lock, ArrowRight } from "lucide-react";

export function SiteNav() {
  const linkCls = "text-sm text-muted-foreground transition hover:text-foreground";
  const active = { className: "text-foreground font-medium" };
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto mt-4 max-w-6xl px-4">
        <div className="glass glow-border flex items-center justify-between rounded-2xl px-5 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-accent shadow-[var(--shadow-glow)]">
              <Lock className="h-4 w-4 text-background" />
            </div>
            <span className="font-semibold tracking-tight">
              EchoVault <span className="text-gradient">AI</span>
            </span>
          </Link>
          <nav className="hidden gap-7 md:flex">
            <Link to="/" className={linkCls} activeOptions={{ exact: true }} activeProps={active}>Home</Link>
            <Link to="/dashboard" className={linkCls} activeProps={active}>Dashboard</Link>
            <Link to="/chat" className={linkCls} activeProps={active}>Reflect</Link>
            <Link to="/waitlist" className={linkCls} activeProps={active}>Waitlist</Link>
          </nav>
          <Link
            to="/waitlist"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.03]"
          >
            Get Access <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-xs text-muted-foreground md:flex-row">
        <p>© 2026 EchoVault AI · Designed & Engineered by Mohammed Ikram Ashrafi</p>
        <div className="flex gap-4">
          <a href="https://mohammed-ikram-ashrafi.in" target="_blank" rel="noreferrer" className="hover:text-foreground">mohammed-ikram-ashrafi.in</a>
          <a href="https://echovaultai.me" target="_blank" rel="noreferrer" className="hover:text-foreground">echovaultai.me</a>
        </div>
      </div>
    </footer>
  );
}

export function PageBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full blur-[140px] animate-glow" style={{ background: "oklch(0.7 0.2 300 / 0.25)" }} />
      <div className="absolute top-1/3 -right-32 h-[480px] w-[480px] rounded-full blur-[160px] animate-glow" style={{ background: "oklch(0.6 0.2 270 / 0.25)", animationDelay: "1s" }} />
      <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full blur-[140px] animate-glow" style={{ background: "oklch(0.74 0.16 165 / 0.18)", animationDelay: "2s" }} />
      <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
    </div>
  );
}
