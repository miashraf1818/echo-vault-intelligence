import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function SiteNav() {
  const linkCls = "text-sm text-muted-foreground transition hover:text-foreground";
  const active = { className: "text-foreground font-medium" };
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-transparent">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-center justify-between py-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-zinc-900">
              <span className="h-1.5 w-1.5 rounded-[2px] bg-white" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              EchoVault <span className="font-normal text-muted-foreground">AI</span>
            </span>
          </Link>
          <nav className="hidden gap-8 md:flex">
            <Link to="/" className={linkCls} activeOptions={{ exact: true }} activeProps={active}>Home</Link>
            <Link to="/dashboard" className={linkCls} activeProps={active}>Dashboard</Link>
            <Link to="/chat" className={linkCls} activeProps={active}>Reflect</Link>
            <Link to="/waitlist" className={linkCls} activeProps={active}>Waitlist</Link>
          </nav>
          <Link
            to="/waitlist"
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-[13px] font-medium text-zinc-50 transition hover:bg-zinc-800"
          >
            Join waitlist <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-xs text-muted-foreground md:flex-row">
        <p>© 2026 EchoVault AI — designed & engineered by Mohammed Ikram Ashrafi</p>
        <div className="flex gap-5">
          <a href="https://www.mohammed-ikram-ashrafi.in/" target="_blank" rel="noreferrer" className="hover:text-foreground">Portfolio</a>
          <a href="https://github.com/miashraf1818" target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub</a>
          <a href="https://www.linkedin.com/in/mohammed-ikram-ashrafi/" target="_blank" rel="noreferrer" className="hover:text-foreground">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}

/** Soft cobalt halo behind hero content — used sparingly. */
export function PageBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute left-1/2 top-[-10%] h-[640px] w-[640px] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(closest-side, oklch(0.85 0.12 264 / 0.25), transparent 70%)" }}
      />
    </div>
  );
}
