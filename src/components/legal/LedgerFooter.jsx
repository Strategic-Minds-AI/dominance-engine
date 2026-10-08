import { Link } from "react-router-dom";

const COLS = [
  {
    title: "Practice",
    links: ["Personal Injury", "Criminal Defense", "Family Law", "Business Litigation", "Employment", "Estate Planning"],
  },
  {
    title: "Firm",
    links: ["The Partners", "The Record", "Our Approach", "Press", "Careers"],
  },
  {
    title: "Contact",
    links: ["1 Penn Plaza, New York", "hello@meridianlaw.example", "+1 (555) 010-1994", "Mon–Fri · 8a–8p ET"],
  },
];

export default function LedgerFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-16 md:py-24">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-3">
            <span className="font-heading text-3xl font-light">MERIDIAN</span>
            <p className="mt-4 text-xs tracking-[0.2em] uppercase text-muted-foreground">Law · LLP</p>
            <p className="mt-6 text-sm text-muted-foreground max-w-xs leading-relaxed">
              A litigation firm. Verdicts, not promises.
            </p>
          </div>

          {COLS.map((c) => (
            <div key={c.title} className="md:col-span-3 md:border-l md:border-border md:pl-8">
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-5">{c.title}</p>
              <ul className="space-y-3">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#briefing" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            © {new Date().getFullYear()} Meridian Law LLP · Attorney Advertising
          </p>
          <div className="flex gap-6">
            <a href="#top" className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground">Privacy</a>
            <a href="#top" className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground">Terms</a>
            <a href="#top" className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground">Disclaimer</a>
            <Link to="/admin" className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}