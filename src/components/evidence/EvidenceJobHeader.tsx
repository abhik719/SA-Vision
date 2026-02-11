import { Pin, Download, ExternalLink, MessageSquare } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useThreadStore } from '../../store/useThreadStore';
import StatusPill from '../ui/StatusPill';
import type { Job } from '../../types/job';

interface Props {
  job: Job;
}

export default function EvidenceJobHeader({ job }: Props) {
  const selectThread = useAppStore((s) => s.selectThread);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const threadsById = useThreadStore((s) => s.threadsById);

  const originThread = job.originThreadId
    ? threadsById[job.originThreadId]
    : null;

  const handleGoToThread = () => {
    if (originThread) {
      setActiveTab('THREADS');
      selectThread(originThread.id);
    }
  };

  // Format timestamp
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  // Scope label
  const scopeLabel = job.scopeOutput || (() => {
    const parts: string[] = [];
    if (job.inputs?.accountIds?.length) parts.push(`${job.inputs.accountIds.length} accounts`);
    if (job.inputs?.leadIds?.length) parts.push(`${job.inputs.leadIds.length} leads`);
    if (job.inputs?.personas?.length) parts.push(job.inputs.personas.join(', '));
    return parts.join(' · ') || undefined;
  })();

  return (
    <div
      className="flex shrink-0 flex-col bg-white"
      style={{ borderBottom: '1px solid var(--border-standard)' }}
    >
      {/* Title row + header actions: 8px below breadcrumb (breadcrumb is in EvidenceBreadcrumb) */}
      <div className="flex items-start justify-between px-[24px] pt-[8px] pb-[4px]">
        <h2 className="font-display text-[18px] font-semibold leading-snug text-li-text-primary">
          {job.title}
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

      {/* Meta row: 8px below title */}
      <div className="flex flex-wrap items-center gap-x-[16px] gap-y-[4px] px-[24px] pb-[12px]">
        <StatusPill status={job.status} />

        {originThread && (
          <button
            onClick={handleGoToThread}
            className="flex items-center gap-[4px] font-body text-[12px] text-li-text-tertiary transition-colors hover:text-li-blue hover:underline"
          >
            Created from: {originThread.title}
          </button>
        )}

        {scopeLabel && (
          <span className="font-body text-[12px] text-li-text-tertiary">
            {scopeLabel}
          </span>
        )}

        <span className="font-body text-[12px] text-li-text-disabled">
          Updated {formatDate(job.updatedAt)}
        </span>

        {/* "Adjust in thread" affordance */}
        {originThread && (
          <button
            onClick={handleGoToThread}
            className="ml-auto flex items-center gap-[4px] rounded-[4px] px-[8px] py-[3px] font-body text-[12px] font-medium text-li-text-tertiary transition-colors hover:bg-li-bg-hover hover:text-li-blue"
          >
            <MessageSquare size={12} />
            Adjust in thread
          </button>
        )}
      </div>
    </div>
  );
}
