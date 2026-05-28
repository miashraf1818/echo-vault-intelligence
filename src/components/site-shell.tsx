import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

interface NavLink {
  to: "/" | "/dashboard" | "/chat" | "/demo" | "/waitlist";
  label: string;
  exact?: boolean;
}

const NAV_LINKS: readonly NavLink[] = [
  { to: "/", label: "Home", exact: true },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/chat", label: "Reflect" },
  { to: "/demo", label: "Demo" },
  { to: "/waitlist", label: "Waitlist" },
];

export function SiteNav() {
  const linkCls =
    "text-sm text-muted-foreground transition hover:text-foreground";
  const active = { className: "text-foreground font-medium" };

  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile menu on route changes (the buttons inside it are
  // <Link>s, so they fire navigation, but we still flip state to drop
  // the overlay immediately).
  // Also close on Escape and prevent body scroll while open.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-transparent">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between py-4 md:py-5">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-zinc-900">
              <span className="h-1.5 w-1.5 rounded-[2px] bg-white" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              EchoVault{" "}
              <span className="font-normal text-muted-foreground">AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={linkCls}
                activeOptions={l.exact ? { exact: true } : undefined}
                activeProps={active}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right side: desktop CTA + mobile hamburger */}
          <div className="flex items-center gap-2">
            <Link
              to="/waitlist"
              className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-[13px] font-medium text-zinc-50 transition hover:bg-zinc-800"
            >
              Join waitlist <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              className="grid h-10 w-10 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-900 transition hover:bg-zinc-50 md:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer overlay. Rendered conditionally so SSR / a11y
          stay clean when closed. */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-nav-title"
          id="mobile-nav"
        >
          {/* Scrim */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />

          {/* Panel */}
          <div className="absolute right-0 top-0 flex h-full w-[min(86vw,20rem)] flex-col bg-background shadow-[0_24px_60px_-30px_oklch(0_0_0/0.4)]">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span
                id="mobile-nav-title"
                className="text-[14px] font-semibold tracking-tight"
              >
                EchoVault{" "}
                <span className="font-normal text-muted-foreground">AI</span>
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-900 transition hover:bg-zinc-50"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 px-4 py-5">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  activeOptions={l.exact ? { exact: true } : undefined}
                  activeProps={{
                    className:
                      "block rounded-lg bg-zinc-100 px-4 py-3 text-[15px] font-semibold text-zinc-950",
                  }}
                  className="block rounded-lg px-4 py-3 text-[15px] text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-950"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-border p-4">
              <Link
                to="/waitlist"
                onClick={() => setMobileOpen(false)}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-3 text-[14px] font-medium text-zinc-50 transition hover:bg-zinc-800"
              >
                Join waitlist <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-center text-xs text-muted-foreground sm:px-6 md:flex-row md:text-left">
        <p>© 2026 EchoVault AI — designed & engineered by Mohammed Ikram Ashrafi</p>
        <div className="flex gap-5">
          <a
            href="https://www.mohammed-ikram-ashrafi.in/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            Portfolio
          </a>
          <a
            href="https://github.com/miashraf1818"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/mohammed-ikram-ashrafi/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}

/** Soft cobalt halo behind hero content — used sparingly. */
export function PageBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute left-1/2 top-[-10%] h-[640px] w-[640px] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.85 0.12 264 / 0.25), transparent 70%)",
        }}
      />
    </div>
  );
}
