import { useState } from 'react';
import type { Job } from '../../types/job';
import { useJobStore } from '../../store/useJobStore';
import { useAppStore } from '../../store/useAppStore';
import { useThreadStore } from '../../store/useThreadStore';
import {
  MoreHorizontal,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

interface Props {
  job: Job;
  selected: boolean;
  onClick: () => void;
}

export default function JobListItem({ job, selected, onClick }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(job.title);

  const renameJob = useJobStore((s) => s.renameJob);
  const archiveJob = useJobStore((s) => s.archiveJob);
  const unarchiveJob = useJobStore((s) => s.unarchiveJob);
  const deleteJob = useJobStore((s) => s.deleteJob);
  const selectJob = useAppStore((s) => s.selectJob);
  const selectThread = useAppStore((s) => s.selectThread);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const threadsById = useThreadStore((s) => s.threadsById);

  const isUnseen = job.status === 'COMPLETED' && !job.viewedAt;

  // Scope → Outcome subtitle
  const subtitle = job.scopeOutput || buildSubtitle(job);

  void (job.status === 'NEEDS_APPROVAL' || isUnseen); // needsAttention reserved for future use

  const handleClick = () => {
    onClick();
  };

  const handleRenameSubmit = () => {
    if (renameValue.trim()) renameJob(job.id, renameValue.trim());
    setRenaming(false);
  };

  const setCurrentEvidence = useAppStore((s) => s.setCurrentEvidence);

  const handleGoToThread = () => {
    if (job.originThreadId) {
      // Open the linked thread in left pane, but keep job evidence in right pane
      setActiveTab('THREADS');
      selectThread(job.originThreadId);
      // Re-set the job's evidence after selectThread clears it
      if (job.evidenceId) {
        setCurrentEvidence(job.evidenceId);
      }
    }
    setMenuOpen(false);
  };

  const originThread = job.originThreadId ? threadsById[job.originThreadId] : null;

  return (
    <div
      className={`group relative flex cursor-pointer flex-col gap-[2px] py-[10px] transition-colors hover:bg-li-bg-hover ${
        selected
          ? 'border-l-[4px] border-l-li-blue pl-[12px] pr-[16px]'
          : 'border-l-[4px] border-l-transparent pl-[12px] pr-[16px]'
      }`}
      style={{ borderBottom: '1px solid var(--border-standard)' }}
      onClick={handleClick}
    >
      {/* Row 1: title + status + timestamp */}
      <div className="flex items-center gap-[6px]">
        {isUnseen && (
          <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-li-blue" />
        )}
        {renaming ? (
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit();
              if (e.key === 'Escape') setRenaming(false);
            }}
            onClick={(e) => e.stopPropagation()}
            className="min-w-0 flex-1 rounded border border-li-blue bg-white px-[4px] py-[1px] font-body text-ds-small font-semibold text-li-text-primary outline-none"
          />
        ) : (
          <span className="flex-1 truncate font-body text-ds-base font-semibold text-li-text-primary">
            {job.title}
          </span>
        )}
        <span className="shrink-0 font-body text-[11px] text-li-text-tertiary">
          {relativeTime(job.updatedAt)}
        </span>
      </div>

      {/* Row 2: scope → outcome subtitle */}
      {subtitle && (
        <span className="truncate font-body text-[11px] text-li-text-tertiary">
          {subtitle}
        </span>
      )}

      {/* Row 3: thread chip */}
      {originThread && (
        <button
          onClick={(e) => { e.stopPropagation(); handleGoToThread(); }}
          className="mt-[2px] flex min-h-[24px] max-w-full items-center gap-[4px] self-start rounded-[4px] border border-li-border-standard bg-white px-[7px] py-[2px] font-body text-[11px] text-li-text-secondary transition-colors hover:border-li-text-tertiary hover:text-li-blue hover:underline"
          title="Open linked thread (keeps this job open)"
          aria-label={`Open linked thread: ${originThread.title} (keeps job open)`}
        >
          <MessageSquare size={10} className="shrink-0 opacity-60" />
          <span className="truncate">In thread: {originThread.title}</span>
          <ChevronRight size={9} className="shrink-0 opacity-40" />
        </button>
      )}

      {/* Hover overflow */}
      <div className="absolute bottom-[8px] right-[8px]">
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className="hidden rounded p-[3px] text-li-text-tertiary hover:bg-li-bg-hover group-hover:block"
        >
          <MoreHorizontal size={14} />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
            <div className="absolute bottom-full right-0 z-20 mb-[2px] flex w-[170px] flex-col rounded-ds-card border border-li-border-standard bg-white py-[4px] shadow-md">
              <MenuAction
                icon={<Pencil size={12} />}
                label="Rename"
                onClick={() => {
                  setRenameValue(job.title);
                  setRenaming(true);
                  setMenuOpen(false);
                }}
              />
              {originThread && (
                <MenuAction
                  icon={<MessageSquare size={12} />}
                  label="Go to thread"
                  onClick={handleGoToThread}
                />
              )}
              {job.archived ? (
                <MenuAction
                  icon={<ArchiveRestore size={12} />}
                  label="Unarchive"
                  onClick={() => { unarchiveJob(job.id); setMenuOpen(false); }}
                />
              ) : (
                <MenuAction
                  icon={<Archive size={12} />}
                  label="Archive"
                  onClick={() => { archiveJob(job.id); setMenuOpen(false); }}
                />
              )}
              <div className="my-[2px] border-t border-li-border-standard" />
              <MenuAction
                icon={<Trash2 size={12} />}
                label="Delete"
                danger
                onClick={() => {
                  deleteJob(job.id);
                  selectJob(null);
                  setMenuOpen(false);
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Auto-generate a "Scope → Outcome" subtitle from job data */
function buildSubtitle(job: Job): string {
  const parts: string[] = [];

  // Scope
  const acctCount = job.inputs.accountIds?.length;
  const leadCount = job.inputs.leadIds?.length;
  if (acctCount) parts.push(`${acctCount} account${acctCount !== 1 ? 's' : ''}`);
  else if (leadCount) parts.push(`${leadCount} lead${leadCount !== 1 ? 's' : ''}`);

  // Outcome
  const s = job.outputs?.summary;
  if (s) {
    const outcomes: string[] = [];
    if (s.leadsFound) outcomes.push(`${s.leadsFound} leads found`);
    if (s.coverageGaps) outcomes.push(`${s.coverageGaps} gaps`);
    if (s.accountsCovered) outcomes.push(`${s.accountsCovered} accounts covered`);
    if (s.draftsCreated) outcomes.push(`${s.draftsCreated} drafts created`);
    if (s.draftsApproved) outcomes.push(`${s.draftsApproved} approved`);
    if (outcomes.length) parts.push(outcomes.join(', '));
  }

  return parts.join(' → ');
}

function MenuAction({ icon, label, danger, onClick }: { icon: React.ReactNode; label: string; danger?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`flex items-center gap-[8px] px-[10px] py-[5px] text-left font-body text-ds-small transition-colors hover:bg-li-bg-hover ${
        danger ? 'text-[#CC1016]' : 'text-li-text-primary'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
