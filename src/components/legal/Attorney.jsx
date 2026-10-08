const CREDENTIALS = [
  "Harvard Law, J.D. — 1994",
  "Admitted: NY, CA, USDC, USCA 2nd & 9th",
  "Super Lawyers — Top 100, 2014–2024",
  "ABOTA Member — Order of the Coif",
];

export default function Attorney() {
  return (
    <section id="firm" className="mx-auto max-w-[1400px] px-6 md:px-10 py-20 md:py-32 border-t border-border">
      <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-start">
        <div className="md:col-span-5">
          <p className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground mb-6">The Firm · 03</p>
          <div className="aspect-[3/4] bg-foreground text-background flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-4 border border-background/20" />
            <span className="font-heading text-[12rem] leading-none font-light">M</span>
            <span className="absolute bottom-6 left-6 text-[10px] tracking-[0.3em] uppercase text-background/50">
              Meridian · LLP
            </span>
          </div>
        </div>

        <div className="md:col-span-7 md:pt-20">
          <h2 className="font-heading text-5xl md:text-6xl font-light leading-[0.95] tracking-tight">
            Eleanor V. Whitfield
          </h2>
          <p className="mt-3 text-sm tracking-[0.2em] uppercase text-muted-foreground">Founding Partner · Lead Trial Counsel</p>

          <div className="mt-8 space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
            <p>
              Eleanor built Meridian on a single conviction: a case is not won in a conference room,
              it is won in a courtroom. In thirty years she has tried over 200 matters to verdict and
              recovered more than $240 million for the firm's clients.
            </p>
            <p>
              She is a former federal prosecutor, a Fellow of the American College of Trial Lawyers,
              and the lawyer other lawyers call when their own case is on the line.
            </p>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 gap-x-10 gap-y-3">
            {CREDENTIALS.map((c) => (
              <div key={c} className="flex items-center gap-3 border-t border-border pt-3 text-sm">
                <span className="text-foreground/40 text-[10px]">✦</span>
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}