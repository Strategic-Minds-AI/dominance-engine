import { Phone, Mail, Youtube, Linkedin, Facebook, Instagram, Twitter } from "lucide-react";

export default function TopBar() {
  return (
    <div className="bg-primary text-paper text-xs">
      <div className="mx-auto max-w-[1400px] px-6 h-9 flex items-center justify-between">
        <a
          href="#intake"
          className="bg-crimson text-paper px-3 py-1 rounded-sm font-semibold tracking-[0.15em] uppercase text-[10px] hover:brightness-110"
        >
          Free Evaluation
        </a>
        <div className="hidden md:flex items-center gap-6">
          <a href="mailto:info@yourfirm.com" className="inline-flex items-center gap-2 hover:text-paper/80">
            <Mail className="w-3.5 h-3.5" /> info@yourfirm.com
          </a>
          <a href="tel:+15551234567" className="inline-flex items-center gap-2 hover:text-paper/80">
            <Phone className="w-3.5 h-3.5" /> Call or Text (555) 123-4567
          </a>
        </div>
        <div className="flex items-center gap-3 text-paper/70">
          <a href="https://youtube.com" aria-label="YouTube" target="_blank" rel="noreferrer" className="hover:text-paper"><Youtube className="w-4 h-4" /></a>
          <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noreferrer" className="hover:text-paper"><Linkedin className="w-4 h-4" /></a>
          <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer" className="hover:text-paper"><Facebook className="w-4 h-4" /></a>
          <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer" className="hover:text-paper"><Instagram className="w-4 h-4" /></a>
          <a href="https://twitter.com" aria-label="X" target="_blank" rel="noreferrer" className="hover:text-paper"><Twitter className="w-4 h-4" /></a>
        </div>
      </div>
    </div>
  );
}