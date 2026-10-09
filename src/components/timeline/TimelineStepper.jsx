import React from "react";
import { motion } from "framer-motion";
import { User, Sparkles, Rocket, Layers, Check } from "lucide-react";

const PHASES = [
  { id: 0, label: "Onboarding", icon: User, desc: "Tell us about your business" },
  { id: 1, label: "GPT Sync & Mockups", icon: Sparkles, desc: "10 AI design directions" },
  { id: 2, label: "Website & Social", icon: Rocket, desc: "Full build + 30-day campaign" },
  { id: 3, label: "Programmatic 100x", icon: Layers, desc: "Scale to 100 Google-ready pages" },
];

export default function TimelineStepper({ currentPhase, completedPhases }) {
  return (
    <div className="relative px-2 py-8 sm:px-8">
      {/* Progress line — centered on the 64px circles (top 32px padding + 32px radius) */}
      <div className="absolute top-[62px] left-[8%] right-[8%] h-1 rounded-full bg-white/5" />
      <motion.div
        className="absolute top-[62px] left-[8%] h-1 rounded-full bg-gradient-to-r from-[#00f2ff] to-[#00d4ff]"
        initial={{ width: "0%" }}
        animate={{
          width: `${(completedPhases.length / (PHASES.length - 1)) * 84}%`,
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      {/* Nodes */}
      <div className="relative flex items-start justify-between">
        {PHASES.map((phase) => {
          const isComplete = completedPhases.includes(phase.id);
          const isActive = currentPhase === phase.id;
          const Icon = phase.icon;

          return (
            <div key={phase.id} className="flex flex-1 flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: phase.id * 0.1 }}
                className={`relative flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isComplete
                    ? "border-emerald-400 bg-emerald-400/15"
                    : isActive
                    ? "border-[#00f2ff] bg-[#00f2ff]/10 dd-glow"
                    : "border-white/15 bg-white/5"
                }`}
              >
                {isComplete ? (
                  <Check className="h-7 w-7 text-emerald-400" strokeWidth={3} />
                ) : (
                  <Icon className={`h-7 w-7 ${isActive ? "text-[#00f2ff]" : "text-white/30"}`} />
                )}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-[#00f2ff]"
                    animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
              <div className="mt-3 text-center">
                <div className={`text-xs font-bold uppercase tracking-widest ${
                  isComplete ? "text-emerald-400" : isActive ? "text-[#00f2ff]" : "text-white/40"
                }`}>
                  {phase.label}
                </div>
                <div className="mt-0.5 hidden text-[10px] text-white/30 sm:block">{phase.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}