import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { getVariant } from "@/lib/ab";
import StagePractice from "./StagePractice";
import StageCircumstance from "./StageCircumstance";
import StageParticulars from "./StageParticulars";
import StageConfirmation from "./StageConfirmation";

const TOTAL = 4;

export default function Funnel() {
  const [stage, setStage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    case_type: "", location: "", urgency: "", name: "", email: "", phone: "", description: "",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const next = () => setStage((s) => Math.min(TOTAL - 1, s + 1));
  const prev = () => setStage((s) => Math.max(0, s - 1));

  const submit = async () => {
    if (!form.name || !form.case_type) return;
    setSubmitting(true);
    try {
      await base44.entities.Lead.create({
        name: form.name, email: form.email, phone: form.phone,
        case_type: form.case_type, location: form.location, urgency: form.urgency,
        description: form.description, status: "new", source: "funnel",
        variant: getVariant() || "_control",
      });
      setSubmitting(false);
      next();
    } catch (e) {
      setSubmitting(false);
    }
  };

  const shared = { form, set, next, prev, submitting, submit };

  return (
    <section id="intake" className="bg-paper text-foreground py-20 md:py-28 scroll-mt-20">
      <div className="mx-auto max-w-3xl px-6">
        {stage < TOTAL - 1 && (
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-crimson/10 text-crimson border border-crimson/30 px-4 py-1.5 rounded-full text-[10px] tracking-[0.3em] uppercase mb-5">
              Free Case Review · No Fee Unless We Win
            </span>
            <p className="text-muted-foreground max-w-md mx-auto">
              Answer a few quick questions to see if you have a case and what it could be worth.
            </p>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.7, 0, 0.2, 1] }}
            className="w-full"
          >
            {stage === 0 && <StagePractice {...shared} />}
            {stage === 1 && <StageCircumstance {...shared} />}
            {stage === 2 && <StageParticulars {...shared} />}
            {stage === 3 && <StageConfirmation form={form} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}