import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, PlusCircle, CheckCircle, ShieldAlert, X, ArrowRight } from 'lucide-react';

interface ResponderOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  step: number;
  setStep: (step: number) => void;
  isGuestResponder: boolean;
}

export const ResponderOnboarding: React.FC<ResponderOnboardingProps> = ({
  isOpen,
  onClose,
  step,
  setStep,
  isGuestResponder
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      title: "Live Incident Feed",
      subtitle: "Real-Time Field Coordination",
      description: "Responders monitor citizen-reported safety hazards, active flooding, and critical outages in real-time. Instead of reporting incidents, you have instant situational awareness to track ongoing field emergencies as they develop.",
      icon: Radio,
      iconBg: isGuestResponder 
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
      color: isGuestResponder ? "from-amber-500 to-orange-500" : "from-blue-500 to-indigo-500",
      accentColor: isGuestResponder ? "text-amber-500 dark:text-amber-400" : "text-blue-500 dark:text-blue-400"
    },
    {
      title: "Add Official Updates",
      subtitle: "Authoritative Communications",
      description: "Post official dispatch updates, agency actions, or survival advisories directly onto any active incident. Keep citizens and other agencies synchronized with verified field progress.",
      icon: PlusCircle,
      iconBg: isGuestResponder 
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
      color: isGuestResponder ? "from-amber-500 to-orange-500" : "from-blue-500 to-indigo-500",
      accentColor: isGuestResponder ? "text-amber-500 dark:text-amber-400" : "text-blue-500 dark:text-blue-400"
    },
    {
      title: "Resolution & Moderation",
      subtitle: "Ensuring Information Integrity",
      description: "Mark emergencies as resolved when cleared, or flag spam, duplicates, and fraudulent reports to protect the platform's integrity. Keeping the dashboard clean ensures efficient resources distribution.",
      icon: CheckCircle,
      iconBg: isGuestResponder 
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
      color: isGuestResponder ? "from-amber-500 to-orange-500" : "from-blue-500 to-indigo-500",
      accentColor: isGuestResponder ? "text-amber-500 dark:text-amber-400" : "text-blue-500 dark:text-blue-400"
    }
  ];

  if (isGuestResponder) {
    steps.push({
      title: "Guest Responder Mode",
      subtitle: "View-Only Access Monitor",
      description: "You are currently exploring as a guest. You can monitor the real-time feed, view maps, and read updates immediately, but posting official updates, resolving incidents, or flagging reports will require you to sign in with an authorized agency account.",
      icon: ShieldAlert,
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
      color: "from-amber-500 to-orange-500",
      accentColor: "text-amber-500 dark:text-amber-400"
    });
  }

  // Guard step index
  const safeStep = Math.min(Math.max(1, step), steps.length);
  const currentStepData = steps[safeStep - 1];
  const IconComponent = currentStepData.icon;

  const handleNext = () => {
    if (safeStep < steps.length) {
      setStep(safeStep + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (safeStep > 1) {
      setStep(safeStep - 1);
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
                RESPONDER TOUR • STEP {safeStep} OF {steps.length}
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
                key={safeStep}
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
                    <span className={`text-[11px] font-bold ${currentStepData.accentColor} uppercase tracking-wider block`}>
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
                    safeStep === idx + 1 
                      ? isGuestResponder
                        ? 'w-6 bg-amber-500 dark:bg-amber-400'
                        : 'w-6 bg-blue-500 dark:bg-blue-400' 
                      : 'w-2 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600'
                  }`}
                  title={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-3">
              {safeStep > 1 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  Back
                </button>
              )}

              {safeStep === steps.length ? (
                <button
                  onClick={onClose}
                  className={`font-bold text-xs tracking-wide px-5 py-2.5 rounded-full flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 text-white ${
                    isGuestResponder
                      ? 'bg-amber-600 hover:bg-amber-500 shadow-[0_4px_12px_rgba(245,158,11,0.25)]'
                      : 'bg-blue-600 hover:bg-blue-500 shadow-[0_4px_12px_rgba(59,130,246,0.25)]'
                  }`}
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
