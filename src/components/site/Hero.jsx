import { ArrowRight } from "lucide-react";

const CRASH = "https://upload.wikimedia.org/wikipedia/commons/e/e1/Car_crash_1.jpg";

export default function Hero() {
  return (
    <section id="top" className="bg-paper text-foreground">
      <div className="mx-auto max-w-[1400px] px-6 py-14 md:py-20 text-center">
        <h1 className="font-heading text-4xl md:text-6xl font-bold uppercase tracking-tight text-primary leading-[1.05]">
          No Fee Unless We Win Your Case!
        </h1>
      </div>

      <div className="relative w-full h-[340px] md:h-[520px] overflow-hidden">
        <img
          src={CRASH}
          alt="Car with severe front-end damage after a crash"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="mx-auto max-w-[1400px] px-6 py-14 md:py-20 text-center">
        <h2 className="font-heading text-4xl md:text-6xl font-bold uppercase tracking-tight text-primary leading-[1.05]">
          Got Into a Car Accident?
        </h2>
        <p className="mt-5 text-lg text-foreground/70 max-w-xl mx-auto">
          Tell us what happened. In two minutes, see if you have a case and what it could be worth.
        </p>
        <a
          href="#intake"
          className="mt-8 inline-flex items-center gap-3 bg-crimson text-paper px-10 py-5 text-xs font-semibold tracking-[0.25em] uppercase rounded-sm hover:brightness-110 transition"
        >
          Start My Free Case Review <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}