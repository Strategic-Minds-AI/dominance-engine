import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const LINKS = [
  { label: "Practice Areas", href: "#practice" },
  { label: "The Firm", href: "#firm" },
  { label: "Results", href: "#results" },
  { label: "The Briefing", href: "#briefing" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const go = (href) => {
    setOpen(false);
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${
          scrolled ? "bg-background/85 backdrop-blur-md border-b border-border" : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-3 group">
            <span className="font-heading text-xl md:text-2xl font-medium tracking-tight">MERIDIAN</span>
            <span className="hidden sm:inline text-[10px] tracking-[0.3em] uppercase text-muted-foreground border-l border-border pl-3">
              Law · LLP
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {LINKS.map((l) => (
              <button
                key={l.label}
                onClick={() => go(l.href)}
                className="text-xs tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="hidden md:inline text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin
            </Link>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase"
              aria-label="Open menu"
            >
              <span className="hidden sm:inline">Menu</span>
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-50 bg-foreground text-background slide-door ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-16 md:h-20 px-6 md:px-10 flex items-center justify-between border-b border-background/15">
          <span className="font-heading text-xl md:text-2xl">MERIDIAN</span>
          <button onClick={() => setOpen(false)} className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase" aria-label="Close menu">
            <span>Close</span>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 md:px-10 py-10 md:py-16 flex flex-col gap-2 md:gap-3">
          {LINKS.map((l, i) => (
            <button
              key={l.label}
              onClick={() => go(l.href)}
              className="group flex items-baseline gap-6 text-left border-b border-background/10 py-4 md:py-6"
            >
              <span className="text-xs tracking-[0.2em] uppercase text-background/40">0{i + 1}</span>
              <span className="font-heading text-4xl md:text-7xl font-light leading-none group-hover:translate-x-3 transition-transform duration-500">
                {l.label}
              </span>
            </button>
          ))}
          <button
            onClick={() => go("#briefing")}
            className="mt-8 self-start ink-spread border border-background px-10 py-5 text-xs tracking-[0.25em] uppercase"
          >
            Secure Counsel
          </button>
          <Link
            to="/admin"
            onClick={() => setOpen(false)}
            className="mt-6 text-[10px] tracking-[0.2em] uppercase text-background/50 hover:text-background"
          >
            Admin Dashboard →
          </Link>
        </div>
      </div>
    </>
  );
}