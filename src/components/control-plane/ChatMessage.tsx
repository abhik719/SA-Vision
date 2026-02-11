import type { Message } from '../../types/thread';
import { useAppStore } from '../../store/useAppStore';
import JobProposalCard from '../cards/JobProposalCard';
import JobResultCard from '../cards/JobResultCard';
import DecisionChips from '../cards/DecisionChips';
import SignalFeedbackCard from '../cards/SignalFeedbackCard';
import { ArrowUpRight } from 'lucide-react';
import clsx from 'clsx';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

interface Props {
  message: Message;
  threadId: string;
}

export default function ChatMessage({ message, threadId }: Props) {
  const setCurrentEvidence = useAppStore((s) => s.setCurrentEvidence);
  const isSeller = message.role === 'seller';

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
          'max-w-[90%] rounded-ds-card px-[12px] py-[8px] font-body text-ds-base leading-relaxed',
          isSeller
            ? 'bg-li-blue text-white'
            : 'bg-li-bg-secondary text-li-text-primary'
        )}
      >
        {message.content}
      </div>

      {/* Evidence links — explicit "Open in Evidence pane" pattern */}
      {message.attachments?.map((att) => (
        <button
          key={att.evidenceId}
          onClick={() => setCurrentEvidence(att.evidenceId)}
          className="flex items-center gap-[4px] rounded-[4px] border border-li-border-standard bg-white px-[8px] py-[4px] font-body text-[11px] font-medium text-li-blue transition-colors hover:border-li-blue hover:bg-li-bg-hover"
        >
          <ArrowUpRight size={11} />
          {att.label}
        </button>
      ))}

      {/* Embedded cards */}
      {message.cardType === 'JOB_PROPOSAL' && message.cardData && (
        <JobProposalCard
          data={message.cardData as import('../../types/thread').JobProposalCardData}
          threadId={threadId}
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
          threadId={threadId}
        />
      )}
    </div>
  );
}
