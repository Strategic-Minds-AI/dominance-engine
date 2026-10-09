import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TimelineStepper from "@/components/timeline/TimelineStepper";
import PhaseOnboarding from "@/components/timeline/PhaseOnboarding";
import PhaseGptMockups from "@/components/timeline/PhaseGptMockups";
import PhaseWebsiteBuild from "@/components/timeline/PhaseWebsiteBuild";
import PhaseProgrammatic from "@/components/timeline/PhaseProgrammatic";

export default function DominanceTimeline() {
  const [phase, setPhase] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [onboarding, setOnboarding] = useState(null);
  const [mockup, setMockup] = useState(null);
  const [buildResult, setBuildResult] = useState(null);

  const advance = (nextPhase) => {
    setCompleted((prev) => [...new Set([...prev, phase])]);
    setPhase(nextPhase);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#05070a]/90 px-4 py-6 backdrop-blur">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Dominance <span className="text-[#00d4ff]">Timeline</span>
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Onboard → GPT Sync → Website + Social → Programmatic 100x. All on your paid Vercel AI Gateway.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="mx-auto max-w-6xl">
        <TimelineStepper currentPhase={phase} completedPhases={completed} />

        {/* Phase content */}
        <div className="px-4 pb-16 sm:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {phase === 0 && (
                <PhaseOnboarding
                  onComplete={(data) => {
                    setOnboarding(data);
                    advance(1);
                  }}
                />
              )}
              {phase === 1 && (
                <PhaseGptMockups
                  onboarding={onboarding}
                  onComplete={(data) => {
                    setMockup(data.selected_mockup);
                    advance(2);
                  }}
                />
              )}
              {phase === 2 && (
                <PhaseWebsiteBuild
                  onboarding={onboarding}
                  mockup={mockup}
                  onComplete={(result) => {
                    setBuildResult(result);
                    advance(3);
                  }}
                />
              )}
              {phase === 3 && (
                <PhaseProgrammatic
                  onboarding={onboarding}
                  buildResult={buildResult}
                  onComplete={() => {
                    setPhase(0);
                    setCompleted([]);
                    setOnboarding(null);
                    setMockup(null);
                    setBuildResult(null);
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}