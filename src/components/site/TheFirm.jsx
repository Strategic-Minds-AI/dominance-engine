const STATS = [
  { value: "$50M+", label: "Recovered for clients" },
  { value: "20+", label: "Years of experience" },
  { value: "1,000+", label: "Cases won" },
  { value: "24/7", label: "Free consultations" },
];

export default function TheFirm() {
  return (
    <section id="firm" className="bg-primary text-paper py-20 md:py-28 scroll-mt-20">
      <div className="mx-auto max-w-[1400px] px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-crimson mb-3">The Firm</p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold uppercase leading-tight mb-6">
            A firm built to win for the injured.
          </h2>
          <p className="text-paper/80 leading-relaxed mb-5">
            YOUR FIRM was founded on one promise: no fee unless we win your case. We level the playing field between crash victims and the insurance companies whose only goal is to pay you as little as possible.
          </p>
          <p className="text-paper/80 leading-relaxed mb-8">
            From day one, our attorneys investigate your crash, preserve the evidence, and build the strongest claim for what your case is really worth. You focus on healing. We handle the rest.
          </p>
          <a
            href="#intake"
            className="inline-flex items-center gap-3 bg-crimson text-paper px-8 py-4 text-xs font-semibold tracking-[0.25em] uppercase rounded-sm hover:brightness-110"
          >
            Get My Free Review
          </a>
        </div>
        <div className="grid grid-cols-2 gap-px bg-paper/15">
          {STATS.map((s) => (
            <div key={s.label} className="bg-primary p-8 text-center">
              <div className="font-heading text-4xl md:text-5xl font-bold text-paper">{s.value}</div>
              <p className="mt-2 text-[11px] tracking-[0.2em] uppercase text-paper/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}