import { Pin, Download, ExternalLink } from 'lucide-react';
import type { Thread } from '../../types/thread';

interface Props {
  thread: Thread;
}

export default function EvidenceThreadHeader({ thread }: Props) {
  // Auto-generated thread summary from latest messages
  const latestMessages = thread.messages?.slice(-3) || [];
  const summaryText =
    latestMessages.length > 0
      ? latestMessages
          .filter((m) => m.role === 'agent')
          .map((m) => m.content)
          .slice(-1)[0] || 'Conversation in progress'
      : 'New thread';

  // Truncate summary
  const truncated =
    summaryText.length > 120
      ? summaryText.slice(0, 120) + '...'
      : summaryText;

  return (
    <div
      className="flex shrink-0 flex-col bg-white"
      style={{ borderBottom: '1px solid var(--border-standard)' }}
    >
      {/* Title row + actions */}
      <div className="flex items-start justify-between px-[24px] pt-[8px] pb-[2px]">
        <h2 className="font-display text-[18px] font-semibold leading-snug text-li-text-primary">
          {thread.title}
        </h2>
        <div className="flex shrink-0 items-center gap-[8px]">
          <button
            className="rounded p-[6px] text-li-text-tertiary transition-colors hover:bg-li-bg-hover hover:text-li-text-secondary"
            title="Pin"
          >
            <Pin size={16} />
          </button>
          <button
            className="rounded p-[6px] text-li-text-tertiary transition-colors hover:bg-li-bg-hover hover:text-li-text-secondary"
            title="Export"
          >
            <Download size={16} />
          </button>
          <button
            className="rounded p-[6px] text-li-text-tertiary transition-colors hover:bg-li-bg-hover hover:text-li-text-secondary"
            title="Open in new"
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </div>

      {/* Thread summary: 8px below title */}
      <div className="px-[24px] pb-[12px]">
        <p className="font-body text-[13px] text-li-text-tertiary leading-snug">
          {truncated}
        </p>
      </div>
    </div>
  );
}
