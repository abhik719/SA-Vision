import type { Thread } from '../../types/thread';
import { MessageCircle } from 'lucide-react';

interface Props {
  thread: Thread;
  onSend: (text: string) => void;
}

/** Fallback generic chips when there's not enough context */
const FALLBACK_CHIPS = [
  'What changed since last week?',
  'Show me the hottest accounts',
  'Find leads for top accounts',
];

export default function ContextualSuggestions({ thread, onSend }: Props) {
  const askItems = thread.askSuggestions || [];

  if (askItems.length === 0) {
    return (
      <div className="flex flex-wrap gap-[6px] px-[16px] pb-[8px]">
        {FALLBACK_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => onSend(chip)}
            className="rounded-[4px] border border-li-border-standard bg-white px-[10px] py-[3px] font-body text-[11px] text-li-text-tertiary transition-colors hover:border-li-blue hover:text-li-blue"
          >
            {chip}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[4px] px-[16px] pb-[8px]">
      {/* Follow-up questions (max 2) */}
      <span className="font-body text-[10px] text-li-text-disabled">
        Follow-up questions
      </span>
      {askItems.slice(0, 2).map((item) => (
        <button
          key={item.id}
          onClick={() => onSend(item.question)}
          className="group flex items-center gap-[6px] rounded-[4px] px-[6px] py-[4px] text-left transition-colors hover:bg-li-bg-hover"
        >
          <MessageCircle size={10} className="shrink-0 text-li-text-disabled group-hover:text-li-text-tertiary" />
          <span className="truncate font-body text-[11px] leading-snug text-li-text-tertiary group-hover:text-li-text-secondary">
            {item.question}
          </span>
        </button>
      ))}
    </div>
  );
}
