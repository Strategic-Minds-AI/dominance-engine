import { ArrowDown } from "lucide-react";

export default function Hero() {
  const scrollToBriefing = () =>
    document.querySelector("#briefing")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="top" className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-foreground/10" />
        <div className="absolute inset-x-0 top-1/2 h-px bg-foreground/5" />
      </div>

      <div className="mx-auto max-w-[1400px] w-full px-6 md:px-10 pt-28 md:pt-32 pb-10 md:pb-16 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-8">
          <p className="stamp-in text-[10px] md:text-xs tracking-[0.35em] uppercase text-muted-foreground mb-6 md:mb-10">
            Est. 1994 · A Litigation Firm
          </p>
          <h1 className="stamp-in font-heading font-light leading-[0.92] tracking-tight text-[18vw] md:text-[11vw] lg:text-[9.5rem]">
            The
            <br />
            Resolution.
          </h1>
          <p className="mt-8 md:mt-10 max-w-md text-base md:text-lg text-muted-foreground leading-relaxed">
            For thirty years, Meridian has turned catastrophe into verdicts. We take the cases
            others call impossible, and we close them.
          </p>
        </div>

        <div className="md:col-span-4 flex flex-col justify-end gap-6">
          <div className="border-l-2 border-foreground pl-5">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">Urgency Assessment</p>
            <p className="font-heading text-2xl md:text-3xl leading-snug">
              Tell us what happened. We tell you if you have a case.
            </p>
          </div>
          <button
            onClick={scrollToBriefing}
            className="ink-spread self-start border border-foreground px-8 py-4 text-xs tracking-[0.25em] uppercase"
          >
            Begin the Briefing
          </button>
        </div>
      </div>

      <button
        onClick={() => document.querySelector("#proof")?.scrollIntoView({ behavior: "smooth" })}
        className="mx-auto max-w-[1400px] w-full px-6 md:px-10 pb-8 flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowDown className="w-4 h-4 animate-bounce" />
        Scroll to the record
      </button>
    </section>
  );
}