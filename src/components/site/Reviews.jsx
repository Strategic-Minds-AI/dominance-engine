import { Star, Quote } from "lucide-react";

const REVIEWS = [
  { name: "Maria G.", matter: "Car Accident", text: "After my crash I had no idea what to do. YOUR FIRM handled everything and got me far more than the insurance first offered. I can't recommend them enough." },
  { name: "James R.", matter: "Truck Collision", text: "They fought the trucking company's lawyers and won. The team kept me updated the whole way. Truly thankful." },
  { name: "Dana L.", matter: "Motorcycle Accident", text: "As a rider, I was blamed for the wreck. They reconstructed the crash and proved it wasn't my fault. The settlement changed my life." },
];

export default function Reviews() {
  return (
    <section id="reviews" className="bg-paper text-foreground py-20 md:py-28 scroll-mt-20">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="text-center mb-14">
          <p className="text-[10px] tracking-[0.3em] uppercase text-crimson mb-3">Client Reviews</p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-primary uppercase">What Our Clients Say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {REVIEWS.map((r) => (
            <div key={r.name} className="border border-border p-7">
              <Quote className="w-8 h-8 text-crimson/40 mb-4" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-crimson text-crimson" />
                ))}
              </div>
              <p className="text-foreground/80 leading-relaxed mb-6">"{r.text}"</p>
              <div className="border-t border-border pt-4">
                <p className="font-semibold text-primary">{r.name}</p>
                <p className="text-xs text-foreground/60">{r.matter}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}