import { Phone, Mail, MapPin, Youtube, Linkedin, Facebook, Instagram, Twitter } from "lucide-react";

export default function ContactFooter() {
  return (
    <footer id="contact" className="bg-primary text-paper scroll-mt-20">
      <div className="mx-auto max-w-[1400px] px-6 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="w-10 h-10 rounded-sm bg-paper text-primary flex items-center justify-center font-heading text-xl font-semibold">S</span>
            <span className="font-heading text-xl">YOUR FIRM</span>
          </div>
          <p className="text-paper/70 max-w-sm leading-relaxed">
            Injured in a crash? We fight the insurance companies so you don't have to. No fee unless we win your case.
          </p>
          <a href="#intake" className="mt-6 inline-flex items-center gap-3 bg-crimson text-paper px-6 py-3 text-xs font-semibold tracking-[0.25em] uppercase rounded-sm hover:brightness-110">
            Free Case Review
          </a>
        </div>
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-paper/60 mb-4">Contact</p>
          <a href="tel:+15551234567" className="flex items-center gap-3 text-sm text-paper/80 hover:text-paper mb-3"><Phone className="w-4 h-4" /> (555) 123-4567</a>
          <a href="mailto:info@yourfirm.com" className="flex items-center gap-3 text-sm text-paper/80 hover:text-paper mb-3"><Mail className="w-4 h-4" /> info@yourfirm.com</a>
          <p className="flex items-center gap-3 text-sm text-paper/80"><MapPin className="w-4 h-4" /> Serving the United States</p>
        </div>
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-paper/60 mb-4">Follow</p>
          <div className="flex gap-4 text-paper/80">
            <a href="https://youtube.com" aria-label="YouTube" target="_blank" rel="noreferrer" className="hover:text-paper"><Youtube className="w-5 h-5" /></a>
            <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noreferrer" className="hover:text-paper"><Linkedin className="w-5 h-5" /></a>
            <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer" className="hover:text-paper"><Facebook className="w-5 h-5" /></a>
            <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer" className="hover:text-paper"><Instagram className="w-5 h-5" /></a>
            <a href="https://twitter.com" aria-label="X" target="_blank" rel="noreferrer" className="hover:text-paper"><Twitter className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-paper/15">
        <div className="mx-auto max-w-[1400px] px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-paper/60">
          <p>© {new Date().getFullYear()} YOUR FIRM. All rights reserved.</p>
          <p className="text-paper/40">Attorney advertising. Prior results do not guarantee a similar outcome.</p>
        </div>
      </div>
    </footer>
  );
}