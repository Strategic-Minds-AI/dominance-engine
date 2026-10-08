export default function ClosingCTA() {
  const go = () => document.querySelector("#briefing")?.scrollIntoView({ behavior: "smooth" });
  return (
    <section className="bg-foreground text-background">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-24 md:py-40 text-center">
        <p className="text-[10px] tracking-[0.35em] uppercase text-background/50 mb-8">The Closing Argument</p>
        <h2 className="font-heading text-5xl md:text-8xl font-light leading-[0.95] tracking-tight max-w-4xl mx-auto">
          The strongest case is the one filed first.
        </h2>
        <p className="mt-8 text-background/60 max-w-md mx-auto">
          Every day you wait is a day the other side builds its defense. Begin your briefing now.
        </p>
        <button
          onClick={go}
          className="ink-spread mt-12 inline-flex border border-background px-12 py-5 text-xs tracking-[0.3em] uppercase"
        >
          Secure Counsel
        </button>
      </div>
    </section>
  );
}