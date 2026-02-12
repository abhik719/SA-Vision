import { useState, useRef, useEffect, useMemo } from 'react';
import { MoreHorizontal, Archive, Trash2, Pen, RefreshCw } from 'lucide-react';
import type { Job } from '../../types/job';

interface AgentJobRowProps {
  job: Job;
  selected: boolean;
  onSelect: (jobId: string) => void;
  onArchive: (jobId: string) => void;
  onDelete: (jobId: string) => void;
  onRename: (jobId: string, title: string) => void;
  onMakeRecurring?: (jobId: string) => void;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function statusLabel(status: Job['status']): string {
  const map: Record<string, string> = {
    NEW: 'New',
    QUEUED: 'Queued',
    SCHEDULED: 'Scheduled',
    NEEDS_INPUT: 'Input required',
    RUNNING: 'Running',
    READY_TO_REVIEW: 'Ready for review',
    ARCHIVED: 'Archived',
  };
  return map[status] || status;
}

export function AgentJobRow({ job, selected, onSelect, onArchive, onDelete, onRename, onMakeRecurring }: AgentJobRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(job.title);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renaming]);

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== job.title) onRename(job.id, trimmed);
    setRenaming(false);
  };

  // Recall line (last message, truncated)
  const recallLine = useMemo(() => {
    if (!job.messages || job.messages.length === 0) return job.scopeOutput || '';
    const last = job.messages[job.messages.length - 1];
    return last.content.length > 80 ? last.content.slice(0, 77) + '...' : last.content;
  }, [job.messages, job.scopeOutput]);

  const needsAttention =
    job.status === 'NEEDS_INPUT' ||
    job.status === 'READY_TO_REVIEW' ||
    (job.status === 'NEW' && job.has_unread_results);

  return (
    <div
      className={`group relative flex cursor-pointer flex-col gap-[4px] px-[16px] py-[10px] transition-colors border-l-[3px] ${
        selected
          ? 'border-l-li-blue bg-li-bg-selected'
          : needsAttention
            ? 'border-l-li-blue/40 hover:bg-li-bg-hover'
            : 'border-l-transparent hover:bg-li-bg-hover'
      }`}
      style={{ borderBottom: '1px solid var(--border-standard)' }}
      onClick={() => onSelect(job.id)}
    >
      {/* Row 1: Title + Time */}
      <div className="flex items-center gap-[6px]">
        {renaming ? (
          <input
            ref={inputRef}
            className="flex-1 rounded border border-li-blue px-[4px] py-[1px] font-body text-ds-base font-semibold text-li-text-primary outline-none"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') { setRenameValue(job.title); setRenaming(false); }
            }}
          />
        ) : (
          <span className="flex-1 truncate font-body text-ds-base font-semibold text-li-text-primary">
            {job.title}
          </span>
        )}
        <span className="shrink-0 font-body text-ds-small text-li-text-tertiary">
          {timeAgo(job.updatedAt)}
        </span>
      </div>

      {/* Row 2: Meta chips */}
      <div className="flex items-center gap-[4px]">
        {/* Unread dot */}
        {job.has_unread_results && (
          <span className="mr-[2px] h-[6px] w-[6px] shrink-0 rounded-full bg-li-blue" />
        )}

        {/* Status chip */}
        {job.status !== 'ARCHIVED' && (
          <span className="inline-flex items-center rounded-ds-tag px-[5px] py-[1px] font-body text-[10px] font-semibold bg-li-tag-bg text-li-text-secondary">
            {statusLabel(job.status)}
          </span>
        )}

        {job.scopeLabel && (
          <span className="inline-flex items-center rounded-ds-tag px-[5px] py-[1px] font-body text-[10px] font-semibold bg-li-tag-bg text-li-text-secondary">
            {job.scopeLabel}
          </span>
        )}
      </div>

      {/* Row 3: Recall line */}
      {recallLine && (
        <span className="truncate font-body text-ds-small text-li-text-tertiary">
          {recallLine}
        </span>
      )}

      {/* Overflow menu trigger */}
      <button
        className="absolute top-[28px] right-[12px] hidden shrink-0 rounded-[4px] p-[2px] text-li-text-tertiary transition-colors hover:bg-li-bg-hover hover:text-li-text-secondary group-hover:block"
        onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
      >
        <MoreHorizontal size={14} />
      </button>

      {/* Overflow menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute right-[12px] top-[calc(100%-4px)] z-50 w-[160px] rounded-ds-card border border-li-border-standard bg-white py-[4px] shadow-lg"
        >
          <button
            className="flex w-full items-center gap-[8px] px-[12px] py-[6px] text-left font-body text-ds-small text-li-text-primary hover:bg-li-bg-hover"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setRenaming(true); }}
          >
            <Pen size={12} /> Rename
          </button>
          <button
            className="flex w-full items-center gap-[8px] px-[12px] py-[6px] text-left font-body text-ds-small text-li-text-primary hover:bg-li-bg-hover"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onMakeRecurring?.(job.id); }}
          >
            <RefreshCw size={12} /> Make recurring
          </button>
          <button
            className="flex w-full items-center gap-[8px] px-[12px] py-[6px] text-left font-body text-ds-small text-li-text-primary hover:bg-li-bg-hover"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onArchive(job.id); }}
          >
            <Archive size={12} /> {job.archived_at ? 'Unarchive' : 'Archive'}
          </button>
          <button
            className="flex w-full items-center gap-[8px] px-[12px] py-[6px] text-left font-body text-ds-small text-red-600 hover:bg-red-50"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(job.id); }}
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
