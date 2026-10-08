import { useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { label: "The Firm", href: "#firm" },
  { label: "Practice Areas", href: "#practice" },
  { label: "Contact Us", href: "#contact" },
  { label: "Client Reviews", href: "#reviews" },
  { label: "En Español", href: "#intake" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-primary text-paper sticky top-0 z-40 border-b border-white/10">
      <div className="mx-auto max-w-[1400px] px-6 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-sm bg-paper text-primary flex items-center justify-center font-heading text-xl font-semibold">S</span>
          <span className="font-heading text-lg tracking-tight">YOUR FIRM</span>
        </a>
        <nav className="hidden md:flex items-center gap-5 text-[10px] tracking-[0.18em] uppercase text-paper/90">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} className="hover:text-paper whitespace-nowrap">{l.label}</a>
          ))}
          <a href="#intake" className="bg-crimson text-paper px-4 py-2 rounded-sm font-semibold tracking-[0.15em] uppercase hover:brightness-110">Free Case Review</a>
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {open && (
        <nav className="md:hidden bg-primary border-t border-white/10 px-6 py-4 flex flex-col gap-3 text-[11px] tracking-[0.18em] uppercase">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="hover:text-paper">{l.label}</a>
          ))}
          <a href="#intake" onClick={() => setOpen(false)} className="bg-crimson text-paper px-4 py-2 rounded-sm text-center font-semibold">Free Case Review</a>
        </nav>
      )}
    </header>
  );
}