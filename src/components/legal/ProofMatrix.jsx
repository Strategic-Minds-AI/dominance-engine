import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const STATS = [
  { value: 240, prefix: "$", suffix: "M+", label: "Recovered for clients" },
  { value: 1200, prefix: "", suffix: "+", label: "Cases won" },
  { value: 98, prefix: "", suffix: "%", label: "Success rate" },
  { value: 30, prefix: "", suffix: " yrs", label: "In practice" },
];

function CountUp({ to, prefix = "", suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf;
    const start = performance.now();
    const dur = 1400;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {n}
      {suffix}
    </span>
  );
}

export default function ProofMatrix() {
  return (
    <section id="proof" className="border-y border-border">
      <div className="overflow-hidden border-b border-border py-4">
        <div className="marquee flex gap-12 whitespace-nowrap text-muted-foreground">
          {[...Array(2)].map((_, k) => (
            <div key={k} className="flex gap-12">
              {[
                "$12.4M — Trucking collision, 2024",
                "Acquittal — Federal fraud indictment, 2023",
                "$8.1M — Workplace negligence, 2023",
                "Not guilty — Capital defense, 2022",
                "$3.6M — Medical malpractice, 2024",
                "Full custody — Contested divorce, 2023",
              ].map((t) => (
                <span key={t} className="text-xs tracking-[0.2em] uppercase flex items-center gap-12">
                  {t}
                  <span className="text-foreground/30">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div id="results" className="mx-auto max-w-[1400px] px-6 md:px-10 py-16 md:py-28">
        <p className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground mb-10 md:mb-16">
          The Record · 01
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`px-4 md:px-8 py-6 md:py-10 ${i !== 0 ? "md:border-l border-border" : ""} ${
                i % 2 !== 0 ? "border-l border-border md:border-l" : ""
              } ${i >= 2 ? "border-t md:border-t border-border" : ""}`}
            >
              <div className="font-heading text-5xl md:text-7xl font-light leading-none tracking-tight">
                <CountUp to={s.value} prefix={s.prefix} suffix={s.suffix} />
              </div>
              <p className="mt-4 text-[10px] md:text-xs tracking-[0.2em] uppercase text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}