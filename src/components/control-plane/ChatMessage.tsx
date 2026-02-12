import type { Message } from '../../types/thread';
import { useAppStore } from '../../store/useAppStore';
import { useJobStore } from '../../store/useJobStore';
import JobProposalCard from '../cards/JobProposalCard';
import JobResultCard from '../cards/JobResultCard';
import DecisionChips from '../cards/DecisionChips';
import SignalFeedbackCard from '../cards/SignalFeedbackCard';
import { ArrowUpRight } from 'lucide-react';
import clsx from 'clsx';
import { processSellerMessage } from '../../flows/engine';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Render markdown **bold** as <strong> and • bullets as styled bullets */
function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

interface Props {
  message: Message;
  jobId: string;
  /** Whether this is the last message from an agent (chips are interactive) */
  isLastAgentMessage?: boolean;
}

export default function ChatMessage({ message, jobId, isLastAgentMessage }: Props) {
  const setCurrentEvidence = useAppStore((s) => s.setCurrentEvidence);
  const addMessage = useJobStore((s) => s.addMessage);
  const isSeller = message.role === 'seller';

  const handleChipClick = (chip: string) => {
    // Add user message
    addMessage(jobId, {
      id: `msg_${Date.now()}`,
      role: 'seller',
      timestamp: new Date().toISOString(),
      content: chip,
    });
    // Trigger flow engine
    processSellerMessage(jobId, chip);
  };

  return (
    <div
      className={clsx(
        'flex flex-col gap-[6px] px-[16px] py-[8px]',
        isSeller ? 'items-end' : 'items-start'
      )}
    >
      {/* Role label + time */}
      <div className="flex items-center gap-[6px]">
        <span className="font-body text-ds-small font-semibold text-li-text-tertiary">
          {isSeller ? 'You' : 'Agent'}
        </span>
        <span className="font-body text-ds-small text-li-text-disabled">
          {formatTime(message.timestamp)}
        </span>
      </div>

      {/* Message bubble */}
      <div
        className={clsx(
          'max-w-[90%] rounded-ds-card px-[12px] py-[8px] font-body text-ds-base leading-relaxed whitespace-pre-line',
          isSeller
            ? 'bg-li-blue text-white'
            : 'bg-li-bg-secondary text-li-text-primary'
        )}
      >
        {renderMarkdown(message.content)}
      </div>

      {/* Evidence links */}
      {message.attachments?.map((att) => (
        <button
          key={att.evidenceId}
          onClick={() => setCurrentEvidence(att.evidenceId)}
          className="flex items-center gap-[4px] rounded-[4px] border border-li-border-standard bg-white px-[8px] py-[4px] font-body text-ds-small font-semibold text-li-blue transition-colors hover:border-li-blue hover:bg-li-bg-hover"
        >
          <ArrowUpRight size={11} />
          {att.label}
        </button>
      ))}

      {/* Embedded cards */}
      {message.cardType === 'JOB_PROPOSAL' && message.cardData && (
        <JobProposalCard
          data={message.cardData as import('../../types/thread').JobProposalCardData}
          jobId={jobId}
        />
      )}
      {message.cardType === 'JOB_RESULT' && message.cardData && (
        <JobResultCard
          data={message.cardData as import('../../types/thread').JobResultCardData}
        />
      )}
      {message.cardType === 'DECISION_CHIPS' && Array.isArray(message.cardData) && (
        <DecisionChips chips={message.cardData as string[]} />
      )}
      {message.cardType === 'SIGNAL_FEEDBACK' && message.cardData && (
        <SignalFeedbackCard
          data={message.cardData as import('../../types/thread').SignalFeedbackCardData}
          jobId={jobId}
        />
      )}

      {/* Suggested reply chips */}
      {message.suggestedChips && message.suggestedChips.length > 0 && (
        <div className="flex flex-wrap gap-[6px] mt-[2px] max-w-[90%]">
          {message.suggestedChips.map((chip) => (
            <button
              key={chip}
              onClick={() => isLastAgentMessage && handleChipClick(chip)}
              className={clsx(
                'rounded-[16px] border px-[10px] py-[3px] font-body text-ds-small transition-colors',
                isLastAgentMessage
                  ? 'border-li-blue/40 bg-white text-li-blue hover:bg-li-blue hover:text-white cursor-pointer'
                  : 'border-li-border-standard bg-li-bg-secondary text-li-text-disabled cursor-default'
              )}
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
