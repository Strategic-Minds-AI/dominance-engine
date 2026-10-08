import { Car, Truck, Bike as MotorcycleIcon, Bike as BicycleIcon, Footprints, CarFront } from "lucide-react";

const AREAS = [
  { icon: Car, title: "Car Accidents", desc: "Rear-end, head-on, and intersection crashes. We deal with the insurers so you get full value for your claim." },
  { icon: Truck, title: "Truck Collisions", desc: "Commercial truck wrecks cause catastrophic injuries. We go after the carrier and the company." },
  { icon: MotorcycleIcon, title: "Motorcycle Accidents", desc: "Riders get blamed unfairly. We reconstruct the crash and prove the other driver's fault." },
  { icon: Footprints, title: "Pedestrian Accidents", desc: "Crosswalk and sidewalk strikes. You deserve maximum compensation for your injuries." },
  { icon: CarFront, title: "Rideshare Accidents", desc: "Uber and Lyft crashes bring extra insurance layers. We sort them out and pursue every policy." },
  { icon: BicycleIcon, title: "Bicycle Accidents", desc: "Doored, sideswiped, or run off the road. We protect cyclists' rights to a full recovery." },
];

export default function PracticeAreas() {
  return (
    <section id="practice" className="bg-paper text-foreground py-20 md:py-28 scroll-mt-20">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="text-center mb-14">
          <p className="text-[10px] tracking-[0.3em] uppercase text-crimson mb-3">What We Handle</p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-primary uppercase">Practice Areas</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {AREAS.map((a) => (
            <div key={a.title} className="border border-border p-7 hover:border-primary transition-colors">
              <a.icon className="w-9 h-9 text-crimson mb-5" />
              <h3 className="font-heading text-xl font-semibold text-primary mb-2">{a.title}</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">{a.desc}</p>
              <a href="#intake" className="mt-5 inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-crimson font-semibold hover:gap-3 transition-all">Get Help →</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}