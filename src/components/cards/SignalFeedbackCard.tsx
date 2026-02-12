import { useState } from 'react';
import type { SignalFeedbackCardData, SignalFeedbackOption } from '../../types/thread';
import { useSignalPrefsStore } from '../../store/useSignalPrefsStore';
import { useJobStore } from '../../store/useJobStore';
import { processSellerMessage } from '../../flows/engine';
import {
  Globe,
  Tag,
  Building2,
  BellOff,
  Bell,
  Star,
  Check,
} from 'lucide-react';

const ICONS: Record<string, typeof Globe> = {
  globe: Globe,
  tag: Tag,
  building: Building2,
  'bell-off': BellOff,
  bell: Bell,
  star: Star,
};

interface Props {
  data: SignalFeedbackCardData;
  jobId: string;
}

export default function SignalFeedbackCard({ data, jobId }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const addPreference = useSignalPrefsStore((s) => s.addPreference);
  const addMessage = useJobStore((s) => s.addMessage);

  const handleSelect = (option: SignalFeedbackOption) => {
    if (selectedId) return;
    setSelectedId(option.id);

    addPreference({
      id: `pref_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      signalCardId: data.signalCardId,
      signalCategory: data.signalCategory,
      signalTitle: data.signalTitle,
      accountId: data.accountId,
      accountName: data.accountName,
      sentiment: data.sentiment,
      scope: option.scope,
      label: option.label,
      createdAt: new Date().toISOString(),
    });

    addMessage(jobId, {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      role: 'seller',
      timestamp: new Date().toISOString(),
      content: option.label,
    });

    setTimeout(() => {
      processSellerMessage(jobId, `signal_pref_confirmed:${option.scope}:${data.signalCategory}`);
    }, 100);
  };

  const isDown = data.sentiment === 'thumbs_down';

  return (
    <div className="mt-[4px] flex max-w-[90%] flex-col gap-[6px] rounded-ds-card border border-li-border-standard bg-white p-[12px]">
      <div className="flex items-center gap-[6px]">
        <span className="font-body text-ds-small font-semibold uppercase tracking-wider text-li-text-tertiary">
          {isDown ? 'Adjust this signal' : 'Boost this signal'}
        </span>
      </div>

      <div className="flex flex-col gap-[4px]">
        {data.options.map((option) => {
          const Icon = ICONS[option.icon] || Tag;
          const isSelected = selectedId === option.id;
          const isDisabled = selectedId !== null && !isSelected;

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option)}
              disabled={isDisabled}
              className={`flex items-start gap-[8px] rounded-[6px] border px-[10px] py-[8px] text-left transition-all ${
                isSelected
                  ? 'border-li-blue/30 bg-li-blue/5'
                  : isDisabled
                    ? 'border-transparent opacity-40'
                    : 'border-li-border-standard bg-white hover:border-li-blue/20 hover:bg-li-bg-hover'
              }`}
            >
              <div className={`mt-[1px] shrink-0 rounded-[4px] p-[3px] ${
                isSelected ? 'bg-li-blue/10 text-li-blue' : 'bg-li-bg-tertiary text-li-text-tertiary'
              }`}>
                {isSelected ? <Check size={12} /> : <Icon size={12} />}
              </div>
              <div className="flex flex-col gap-[1px]">
                <span className={`font-body text-[12px] font-medium ${
                  isSelected ? 'text-li-blue' : 'text-li-text-primary'
                }`}>
                  {option.label}
                </span>
                <span className="font-body text-ds-small text-li-text-tertiary">
                  {option.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
