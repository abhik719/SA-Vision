import type { Job } from '../../types/job';
import { Zap, MessageCircle } from 'lucide-react';

interface Props {
  job: Job;
  onSend: (text: string) => void;
}

/** Fallback generic chips when there's not enough context */
const FALLBACK_CHIPS = [
  'What changed since last week?',
  'Show me the hottest accounts',
  'Find leads for top accounts',
];

export function ContextualSuggestions({ job, onSend }: Props) {
  const nextItems = job.nextSuggestions || [];
  const askItems = job.askSuggestions || [];

  // If *any* message in this job has inline suggestedChips, this is a chip-driven
  // conversation — hide the bottom fallback suggestions entirely to avoid clutter.
  const hasInlineChips = job.messages.some(
    (m) => m.suggestedChips && m.suggestedChips.length > 0
  );
  if (hasInlineChips) {
    return null;
  }

  if (nextItems.length === 0 && askItems.length === 0) {
    // Don't show generic fallback for RUNNING/QUEUED jobs — the agent is actively working
    if (job.status === 'RUNNING' || job.status === 'QUEUED') {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-[6px] px-[16px] pb-[8px]">
        {FALLBACK_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => onSend(chip)}
            className="rounded-[4px] border border-li-border-standard bg-white px-[10px] py-[3px] font-body text-ds-small text-li-text-tertiary transition-colors hover:border-li-blue hover:text-li-blue"
          >
            {chip}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[4px] px-[16px] pb-[8px]">
      {/* Next best actions */}
      {nextItems.length > 0 && (
        <>
          <span className="font-body text-[10px] text-li-text-disabled">
            Next best actions
          </span>
          {nextItems.slice(0, 2).map((item) => (
            <button
              key={item.id}
              onClick={() => onSend(item.prompt || item.title)}
              className="group flex items-center gap-[6px] rounded-[4px] px-[6px] py-[4px] text-left transition-colors hover:bg-li-bg-hover"
            >
              <Zap size={10} className="shrink-0 text-li-text-disabled group-hover:text-li-blue" />
              <span className="truncate font-body text-ds-small leading-snug text-li-text-tertiary group-hover:text-li-text-secondary">
                {item.title}
              </span>
              <span className="ml-auto shrink-0 rounded-[3px] bg-li-tag-bg px-[5px] py-[1px] font-body text-[9px] font-semibold text-li-text-tertiary group-hover:bg-li-blue/10 group-hover:text-li-blue">
                {item.cta}
              </span>
            </button>
          ))}
        </>
      )}

      {/* Follow-up questions */}
      {askItems.length > 0 && (
        <>
          <span className="mt-[2px] font-body text-[10px] text-li-text-disabled">
            Follow-up questions
          </span>
          {askItems.slice(0, 2).map((item) => (
            <button
              key={item.id}
              onClick={() => onSend(item.question)}
              className="group flex items-center gap-[6px] rounded-[4px] px-[6px] py-[4px] text-left transition-colors hover:bg-li-bg-hover"
            >
              <MessageCircle size={10} className="shrink-0 text-li-text-disabled group-hover:text-li-text-tertiary" />
              <span className="truncate font-body text-ds-small leading-snug text-li-text-tertiary group-hover:text-li-text-secondary">
                {item.question}
              </span>
            </button>
          ))}
        </>
      )}
    </div>
  );
}

export default ContextualSuggestions;
