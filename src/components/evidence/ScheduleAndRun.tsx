import { useState } from 'react';
import { Play, Clock, Shield, Zap, CheckCircle, Calendar } from 'lucide-react';
import type { Evidence } from '../../types/evidence';
import { useAppStore } from '../../store/useAppStore';
import { useJobStore } from '../../store/useJobStore';
import { processSellerMessage } from '../../flows/engine';
import { TERMS } from '../../constants/terms';

interface Props {
  evidence: Evidence;
}

export default function ScheduleAndRun({ evidence }: Props) {
  const [startNow, setStartNow] = useState(true);
  const [maxSendsPerDay, setMaxSendsPerDay] = useState(20);
  const [businessHoursOnly, setBusinessHoursOnly] = useState(true);
  const [stopOnReply, setStopOnReply] = useState(true);
  const [isScheduled, setIsScheduled] = useState(false);

  // const goHome = useAppStore((s) => s.goHome);
  // const setCurrentEvidence = useAppStore((s) => s.setCurrentEvidence);
  const selectedJobId = useAppStore((s) => s.selectedJobId);
  const { addMessage } = useJobStore.getState();

  const handleScheduleAndRun = () => {
    setIsScheduled(true);

    // Post seller message so the action is visible in chat, then let the engine handle it
    const playId = selectedJobId || evidence.context?.jobId || 'play_001';
    const msg = 'Approve all drafts and schedule outreach';
    addMessage(playId, {
      id: `msg_${Date.now()}`,
      role: 'seller',
      timestamp: new Date().toISOString(),
      content: msg,
    });
    setTimeout(() => processSellerMessage(playId, msg), 100);
  };

  const draftCount = evidence.draftCount ?? 14;
  const leadCount = evidence.leadCount ?? 14;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-li-border-standard bg-white px-[24px] py-[16px]">
        <div className="flex items-center gap-[8px]">
          <Calendar size={18} className="text-li-blue" />
          <h2 className="font-display text-[18px] font-semibold text-li-text-primary">
            Schedule & Run
          </h2>
        </div>
        <p className="mt-[4px] font-body text-ds-small text-li-text-secondary">
          {draftCount} drafts approved for {leadCount} leads — ready to go.
        </p>
      </div>

      {isScheduled ? (
        <div className="flex flex-1 items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-[20px] text-center">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-green-50">
              <CheckCircle size={36} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-display text-[20px] font-semibold text-li-text-primary">
                {TERMS.PLAY_SINGULAR} scheduled!
              </h3>
              <p className="mt-[6px] font-body text-[14px] text-li-text-secondary">
                Returning to Agent Home...
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto li-scrollbar bg-white">
          <div className="mx-auto max-w-[520px] px-[24px] py-[24px]">
            {/* Summary */}
            <div className="mb-[24px] rounded-[10px] border border-li-border-standard bg-[#f8f9fa] p-[20px]">
              <h3 className="mb-[12px] font-body text-ds-small font-semibold uppercase tracking-wider text-li-text-tertiary">
                Outreach Summary
              </h3>
              <div className="grid grid-cols-2 gap-[12px]">
                <SummaryItem label="Leads" value={`${leadCount}`} />
                <SummaryItem label="Drafts" value={`${draftCount}`} />
                <SummaryItem label="Channels" value="LinkedIn, Email, InMail" />
                <SummaryItem label="Sequence" value="7-step branching" />
              </div>
            </div>

            {/* When to start */}
            <div className="mb-[20px]">
              <h3 className="mb-[10px] font-body text-[14px] font-semibold text-li-text-primary">
                When to start
              </h3>
              <div className="flex gap-[8px]">
                <OptionPill
                  selected={startNow}
                  onClick={() => setStartNow(true)}
                  icon={<Zap size={14} />}
                  label="Start now"
                />
                <OptionPill
                  selected={!startNow}
                  onClick={() => setStartNow(false)}
                  icon={<Clock size={14} />}
                  label="Schedule for later"
                />
              </div>
            </div>

            {/* Max sends per day */}
            <div className="mb-[20px]">
              <h3 className="mb-[10px] font-body text-[14px] font-semibold text-li-text-primary">
                Max sends per day
              </h3>
              <div className="flex items-center gap-[12px]">
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={maxSendsPerDay}
                  onChange={(e) => setMaxSendsPerDay(Number(e.target.value))}
                  className="h-[4px] flex-1 cursor-pointer appearance-none rounded-full bg-li-bg-tertiary accent-li-blue"
                />
                <span className="w-[48px] text-right font-body text-[14px] font-semibold text-li-text-primary tabular-nums">
                  {maxSendsPerDay}/day
                </span>
              </div>
            </div>

            {/* Guardrails */}
            <div className="mb-[24px]">
              <h3 className="mb-[10px] font-body text-[14px] font-semibold text-li-text-primary">
                Guardrails
              </h3>
              <div className="flex flex-col gap-[8px]">
                <GuardrailToggle
                  icon={<Clock size={14} />}
                  label="Business hours only"
                  sublabel="Send between 8am-6pm recipient local time"
                  enabled={businessHoursOnly}
                  onToggle={() => setBusinessHoursOnly(!businessHoursOnly)}
                />
                <GuardrailToggle
                  icon={<Shield size={14} />}
                  label="Stop on any reply"
                  sublabel="Halt the sequence for a lead when they respond"
                  enabled={stopOnReply}
                  onToggle={() => setStopOnReply(!stopOnReply)}
                />
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleScheduleAndRun}
              className="flex w-full items-center justify-center gap-[8px] rounded-[8px] bg-li-blue px-[20px] py-[12px] font-body text-[14px] font-semibold text-white transition-colors hover:bg-li-blue-dark"
            >
              <Play size={16} />
              Schedule & run
            </button>

            <p className="mt-[8px] text-center font-body text-ds-small text-li-text-tertiary">
              You can pause or cancel at any time from Agent Home.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub components ─────────────────────────────────────── */

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-body text-ds-small text-li-text-tertiary">{label}</span>
      <p className="font-body text-ds-small font-semibold text-li-text-primary">{value}</p>
    </div>
  );
}

function OptionPill({
  selected,
  onClick,
  icon,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-[6px] rounded-[8px] border-[2px] px-[14px] py-[10px] font-body text-ds-small font-semibold transition-colors ${
        selected
          ? 'border-li-blue bg-li-blue/5 text-li-blue'
          : 'border-[#e0e0e0] bg-white text-li-text-secondary hover:border-[#bbb]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function GuardrailToggle({
  icon,
  label,
  sublabel,
  enabled,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-[12px] rounded-[8px] border border-li-border-standard px-[14px] py-[10px]">
      <span className="text-li-text-tertiary">{icon}</span>
      <div className="flex-1">
        <span className="font-body text-ds-small font-semibold text-li-text-primary">{label}</span>
        <p className="font-body text-ds-small text-li-text-tertiary">{sublabel}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative h-[22px] w-[40px] rounded-full transition-colors ${
          enabled ? 'bg-li-blue' : 'bg-[#ccc]'
        }`}
      >
        <span
          className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${
            enabled ? 'left-[20px]' : 'left-[2px]'
          }`}
        />
      </button>
    </div>
  );
}
