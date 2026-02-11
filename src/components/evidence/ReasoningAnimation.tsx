import { useState, useEffect, useCallback } from 'react';
import type { Evidence, ReasoningStep } from '../../types/evidence';
import { useAppStore } from '../../store/useAppStore';
import { Search, Zap, Target, Users, Brain, BarChart3, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  evidence: Evidence;
  hideHeader?: boolean;
}

const ICON_MAP = {
  search: Search,
  zap: Zap,
  target: Target,
  users: Users,
  brain: Brain,
  chart: BarChart3,
};

export default function ReasoningAnimation({ evidence }: Props) {
  const setCurrentEvidence = useAppStore((s) => s.setCurrentEvidence);
  const steps = evidence.reasoningSteps || [];
  const autoAdvanceId = evidence.reasoningAutoAdvanceEvidenceId;

  const [activeStep, setActiveStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  const advanceToNext = useCallback(() => {
    if (autoAdvanceId) {
      setCurrentEvidence(autoAdvanceId);
    }
  }, [autoAdvanceId, setCurrentEvidence]);

  // Step progression
  useEffect(() => {
    if (completed || steps.length === 0) return;

    const currentStep = steps[activeStep];
    if (!currentStep) return;

    const duration = currentStep.duration;
    const interval = 50;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setStepProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          // Move to next step or complete
          if (activeStep < steps.length - 1) {
            setTimeout(() => {
              setActiveStep((s) => s + 1);
              setStepProgress(0);
            }, 200);
          } else {
            setCompleted(true);
            setTimeout(advanceToNext, 600);
          }
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeStep, completed, steps, advanceToNext]);

  return (
    <div className="flex h-full items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-[40px]" style={{ maxWidth: 480 }}>
        {/* Pulsing gradient orb */}
        <div className="relative flex items-center justify-center">
          {/* Outer pulse ring */}
          <div
            className="absolute h-[140px] w-[140px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, #7C3AED 0%, #0A66C2 100%)',
              animation: 'reasoning-pulse 2s ease-in-out infinite',
            }}
          />
          {/* Inner orb */}
          <div
            className="relative flex h-[96px] w-[96px] items-center justify-center rounded-full"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #0A66C2 100%)',
              boxShadow: '0 8px 32px rgba(124, 58, 237, 0.3)',
            }}
          >
            {completed ? (
              <CheckCircle size={36} className="text-white" />
            ) : (
              (() => {
                const step = steps[activeStep];
                if (!step) return null;
                const Icon = ICON_MAP[step.icon] || Brain;
                return <Icon size={36} className="text-white" style={{ animation: 'reasoning-icon-pulse 1.5s ease-in-out infinite' }} />;
              })()
            )}
          </div>
        </div>

        {/* Current step label */}
        <div className="text-center">
          <h3 className="font-display text-[20px] font-semibold text-li-text-primary">
            {completed
              ? evidence.title.replace(/^Analyzing|^Finding|^Scanning/, 'Done —').replace(/\.\.\.$/, '')
              : steps[activeStep]?.label || 'Processing...'}
          </h3>
          <p className="mt-[8px] font-body text-ds-base text-li-text-tertiary">
            {evidence.subtitle || 'This usually takes a few seconds'}
          </p>
        </div>

        {/* Step progress indicators */}
        <div className="flex w-full flex-col gap-[16px]">
          {steps.map((step: ReasoningStep, i: number) => {
            const isDone = i < activeStep || completed;
            const isCurrent = i === activeStep && !completed;
            const Icon = ICON_MAP[step.icon] || Brain;

            return (
              <div key={i} className="flex items-center gap-[12px]">
                <div
                  className={clsx(
                    'flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full transition-all duration-300',
                    isDone
                      ? 'bg-[#E8F5E9] text-[#2F7B15]'
                      : isCurrent
                        ? 'bg-[#EDE7F6] text-[#7C3AED]'
                        : 'bg-li-bg-tertiary text-li-text-disabled'
                  )}
                >
                  {isDone ? (
                    <CheckCircle size={16} />
                  ) : (
                    <Icon size={16} />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-[4px]">
                  <span
                    className={clsx(
                      'font-body text-ds-base transition-colors duration-300',
                      isDone
                        ? 'text-li-text-tertiary'
                        : isCurrent
                          ? 'font-semibold text-li-text-primary'
                          : 'text-li-text-disabled'
                    )}
                  >
                    {step.label}
                  </span>
                  {/* Progress bar */}
                  <div className="h-[3px] w-full overflow-hidden rounded-full bg-li-bg-tertiary">
                    <div
                      className={clsx(
                        'h-full rounded-full transition-all duration-100',
                        isDone
                          ? 'bg-[#2F7B15]'
                          : isCurrent
                            ? 'bg-[#7C3AED]'
                            : 'bg-transparent'
                      )}
                      style={{
                        width: isDone ? '100%' : isCurrent ? `${stepProgress}%` : '0%',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes reasoning-pulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.15); opacity: 0.35; }
        }
        @keyframes reasoning-icon-pulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.08); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
