import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map, AlertTriangle, BarChart3, Phone, X, ArrowRight, CheckCircle } from 'lucide-react';

interface OnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  step: number;
  setStep: (step: number) => void;
  theme: 'light' | 'dark';
}

const steps = [
  {
    title: "Ghana Emergency Map",
    subtitle: "Real-Time Hazard Intelligence",
    description: "Monitor citizen-reported safety hazards, active flooding, and critical outages across Ghana in real-time. Easily filter incidents by category, severity level, or administrative region to stay informed.",
    icon: Map,
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    color: "from-blue-500 to-indigo-500",
    accentColor: "text-blue-500"
  },
  {
    title: "Instant Anonymized Reports",
    subtitle: "Your Voice, Fully Protected",
    description: "Spotted an active hazard or emergency? Use the high-visibility 'Report Emergency' button. Every report is fully anonymous, enabling you to coordinate critical safety data with fellow citizens and dispatch teams without compromising your privacy.",
    icon: AlertTriangle,
    iconBg: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
    color: "from-red-500 to-rose-500",
    accentColor: "text-red-500"
  },
  {
    title: "Analytics Insights",
    subtitle: "Data-Driven Safety Trends",
    description: "Identify regional safety trends and response dynamics. The Analytics tab highlights cumulative monthly reports, response times, active hot-spots, and week-over-week safety improvements.",
    icon: BarChart3,
    iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
    color: "from-indigo-500 to-purple-500",
    accentColor: "text-indigo-500"
  },
  {
    title: "Emergency Directory",
    subtitle: "National Emergency Helpdesk",
    description: "Access verified direct hotlines for official safety services across Ghana. Find regional NADMO desks, fire commanders, healthcare units, and power support teams to request active dispatch assistance.",
    icon: Phone,
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    color: "from-emerald-500 to-teal-500",
    accentColor: "text-emerald-500"
  }
];

export const Onboarding: React.FC<OnboardingProps> = ({
  isOpen,
  onClose,
  step,
  setStep,
  theme
}) => {
  if (!isOpen) return null;

  const currentStepData = steps[step - 1];
  const IconComponent = currentStepData.icon;

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/40 dark:bg-black/75 backdrop-blur-md z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/70 rounded-[28px] shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden my-auto"
        >
          {/* Accent Ambient Glow behind the card */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-tr from-transparent to-slate-200/10 dark:to-zinc-800/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header Controls */}
          <div className="relative z-10 flex items-center justify-between mb-6">
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono font-bold text-slate-400 dark:text-zinc-500 tracking-wider">
                STEP {step} OF {steps.length}
              </span>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-350 transition-colors cursor-pointer"
              title="Skip Tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content with Slide/Fade animation per step */}
          <div className="relative z-10 flex-grow min-h-[220px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Large Visual Icon Container */}
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${currentStepData.iconBg} flex items-center justify-center`}>
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider block">
                      {currentStepData.subtitle}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-50 tracking-tight mt-0.5">
                      {currentStepData.title}
                    </h2>
                  </div>
                </div>

                <p className="text-[14px] text-slate-600 dark:text-zinc-300 font-medium leading-relaxed pt-2">
                  {currentStepData.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Indicators & Navigation Buttons */}
          <div className="relative z-10 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800/60 pt-6 mt-6">
            {/* Dots */}
            <div className="flex items-center gap-2">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setStep(idx + 1)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    step === idx + 1 
                      ? 'w-6 bg-red-500 dark:bg-red-400' 
                      : 'w-2 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600'
                  }`}
                  title={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-3">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  Back
                </button>
              )}

              {step === steps.length ? (
                <button
                  onClick={onClose}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wide px-5 py-2.5 rounded-full shadow-[0_4px_12px_rgba(220,38,38,0.25)] flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Get Started
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="bg-slate-900 hover:bg-slate-850 dark:bg-zinc-50 dark:hover:bg-white text-white dark:text-zinc-950 font-bold text-xs tracking-wide px-5 py-2.5 rounded-full shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  Next
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
