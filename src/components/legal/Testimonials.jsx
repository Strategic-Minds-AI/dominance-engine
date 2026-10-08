const TESTIMONIALS = [
  {
    quote:
      "After the accident, three firms turned me down. Meridian took the case and recovered seven figures in eight months. They did not flinch.",
    name: "D. Alvarez",
    matter: "Personal Injury · 2024",
  },
  {
    quote:
      "The indictment carried twenty years. Eleanor dismantled it in four days of trial. Not guilty on every count. I owe her my life.",
    name: "Client, withheld",
    matter: "Federal Defense · 2023",
  },
  {
    quote:
      "They protected the company and my family in a divorce that should have destroyed both. Discreet, ruthless where it counted, and humane throughout.",
    name: "M. Chen",
    matter: "Family Law · 2023",
  },
];

export default function Testimonials() {
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-20 md:py-32">
        <p className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground mb-12 md:mb-16">Verdicts · In their words</p>
        <div className="grid md:grid-cols-3 border-t border-l border-border">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="border-r border-b border-border p-8 md:p-10 flex flex-col">
              <span className="font-heading text-6xl leading-none text-foreground/20 mb-4">"</span>
              <blockquote className="font-heading text-xl md:text-2xl font-light leading-snug flex-1">
                {t.quote}
              </blockquote>
              <figcaption className="mt-8 pt-6 border-t border-border">
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">{t.matter}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}