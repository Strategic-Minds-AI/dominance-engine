const AREAS = [
  {
    no: "01",
    title: "Personal Injury",
    body: "Catastrophic injury, wrongful death, and commercial vehicle collisions. We advance the cost of reconstruction and take nothing unless we win.",
  },
  {
    no: "02",
    title: "Criminal Defense",
    body: "Felony and federal defense from indictment through verdict. Former prosecutors on staff who know how the other side builds a case.",
  },
  {
    no: "03",
    title: "Family Law",
    body: "High-asset divorce, contested custody, and prenuptial structuring. Discreet, decisive, and built to protect what you have built.",
  },
  {
    no: "04",
    title: "Business Litigation",
    body: "Breach of contract, partnership dissolution, and trade-secret enforcement. We litigate to end the dispute, not to bill it.",
  },
  {
    no: "05",
    title: "Employment",
    body: "Wrongful termination, wage theft, and executive severance. Class actions and individual claims, tried to conclusion.",
  },
  {
    no: "06",
    title: "Estate Planning",
    body: "Trusts, succession, and probate litigation for families and founders. Structures that survive challenge and time.",
  },
];

export default function PracticeAreas() {
  const go = () => document.querySelector("#briefing")?.scrollIntoView({ behavior: "smooth" });
  return (
    <section id="practice" className="mx-auto max-w-[1400px] px-6 md:px-10 py-20 md:py-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-20">
        <div>
          <p className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground mb-6">Practice · 02</p>
          <h2 className="font-heading text-5xl md:text-7xl font-light leading-[0.95] tracking-tight max-w-2xl">
            Six disciplines. One standard.
          </h2>
        </div>
        <p className="max-w-sm text-muted-foreground">
          We refuse more cases than we accept. The matters below are where we are unsurpassed.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 border-t border-l border-border">
        {AREAS.map((a) => (
          <div
            key={a.no}
            className="group border-r border-b border-border p-8 md:p-10 hover:bg-foreground hover:text-background transition-colors duration-300 cursor-pointer"
            onClick={go}
          >
            <div className="flex items-start justify-between mb-8">
              <span className="text-[10px] tracking-[0.3em] uppercase opacity-50">{a.no}</span>
              <span className="text-[10px] tracking-[0.3em] uppercase opacity-0 group-hover:opacity-60 transition-opacity">
                Discuss →
              </span>
            </div>
            <h3 className="font-heading text-2xl md:text-3xl font-normal mb-4">{a.title}</h3>
            <p className="text-sm leading-relaxed opacity-70 group-hover:opacity-90">{a.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}