import { BarChart3, Users, GitBranch, Mail, Check } from 'lucide-react';
import clsx from 'clsx';

export interface PlayStep {
  label: string;
  desc: string;
  icon: typeof BarChart3;
}

const PLAY_STEPS: PlayStep[] = [
  { label: 'Rank accounts', desc: 'Signal-driven priority list', icon: BarChart3 },
  { label: 'Surface leads', desc: 'With reason-for-now signals', icon: Users },
  { label: 'Outreach plan', desc: 'Multi-channel sequence', icon: GitBranch },
  { label: 'Draft messages', desc: 'Personalized per lead', icon: Mail },
  { label: 'Review & run', desc: 'You approve, then it runs', icon: Check },
];

interface Props {
  /** The step currently being VIEWED */
  currentStep: number;
  /** The furthest step the play has reached (defaults to currentStep) */
  progressStep?: number;
  /** Optional label for the active step */
  stepNote?: string;
  /** Called when user clicks a reachable step */
  onStepClick?: (step: number) => void;
}

export default function PlayTimeline({ currentStep, progressStep, stepNote, onStepClick }: Props) {
  const maxStep = progressStep ?? currentStep;

  return (
    <div className="flex shrink-0 items-center gap-[6px] bg-white px-[20px] py-[10px]" style={{ borderBottom: '1px solid var(--border-standard)' }}>
      {/* Play indicator */}
      <span className="shrink-0 font-body text-ds-small font-semibold text-li-text-tertiary">
        Play overview
      </span>

      {/* Separator */}
      <div className="h-[20px] w-px shrink-0 bg-li-border-standard" />

      {PLAY_STEPS.map((step, i) => {
        const Icon = step.icon;
        const isViewing = i === currentStep;
        const isDone = i < maxStep;
        const isProgressFront = i === maxStep && i !== currentStep;
        const isReachable = i <= maxStep;
        const isPending = i > maxStep;
        const isClickable = isReachable && !isViewing && onStepClick;

        return (
          <div key={i} className="flex flex-1 items-center gap-[2px]">
            {/* Step pill */}
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(i)}
              className={clsx(
                'flex items-center gap-[6px] rounded-[6px] px-[8px] py-[5px] transition-all',
                isViewing && 'bg-li-blue/8',
                isDone && !isViewing && 'bg-[#E8F5E9]/60',
                isProgressFront && 'bg-li-blue/5',
                isPending && 'bg-transparent',
                isClickable && 'cursor-pointer hover:bg-[#E8F5E9]/90',
                !isClickable && !isViewing && 'cursor-default',
              )}
            >
              <div
                className={clsx(
                  'flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full transition-colors',
                  isViewing && 'bg-li-blue text-white',
                  isDone && !isViewing && 'bg-[#2E7D32] text-white',
                  isProgressFront && 'bg-li-blue/60 text-white',
                  isPending && 'bg-[#e8e8e8] text-li-text-disabled',
                )}
              >
                {isDone && !isViewing ? (
                  <Check size={12} strokeWidth={3} />
                ) : (
                  <Icon size={12} />
                )}
              </div>
              <div className="flex flex-col">
                <span
                  className={clsx(
                    'font-body text-ds-small font-semibold leading-tight',
                    isViewing && 'text-li-blue',
                    isDone && !isViewing && 'text-[#2E7D32]',
                    isProgressFront && 'text-li-blue/70',
                    isPending && 'text-li-text-disabled',
                  )}
                >
                  {step.label}
                </span>
                {isViewing && stepNote && (
                  <span className="font-body text-[10px] text-li-text-tertiary">{stepNote}</span>
                )}
              </div>
            </button>

            {/* Connector line */}
            {i < PLAY_STEPS.length - 1 && (
              <div
                className={clsx(
                  'h-[1px] flex-1 transition-colors',
                  i < maxStep ? 'bg-[#2E7D32]/30' : 'bg-[#e0e0e0]',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export { PLAY_STEPS };
