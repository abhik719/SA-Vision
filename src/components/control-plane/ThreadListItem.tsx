import { useState } from 'react';
import type { Thread } from '../../types/thread';
import { useThreadStore } from '../../store/useThreadStore';
import { useAppStore } from '../../store/useAppStore';
import { useSectionStore } from '../../store/useSectionStore';
import Badge from '../ui/Badge';
import ScopeChip from '../ui/ScopeChip';
import {
  MoreHorizontal,
  Pin,
  PinOff,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
  FolderInput,
  ChevronDown,
  Undo2,
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
  thread: Thread;
  selected?: boolean;
  onClick: () => void;
}

export default function ThreadListItem({ thread, selected, onClick }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moveExpanded, setMoveExpanded] = useState(false);

  const pinThread = useThreadStore((s) => s.pinThread);
  const unpinThread = useThreadStore((s) => s.unpinThread);
  const renameThread = useThreadStore((s) => s.renameThread);
  const deleteThread = useThreadStore((s) => s.deleteThread);
  const archiveThread = useThreadStore((s) => s.archiveThread);
  const unarchiveThread = useThreadStore((s) => s.unarchiveThread);
  const setThreadSection = useThreadStore((s) => s.setThreadSection);
  const selectThread = useAppStore((s) => s.selectThread);
  const sections = useSectionStore((s) => s.sections);

  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(thread.title);

  // Recall line: last meaningful user message, fall back to decision summary, then last agent message
  const recallLine = (() => {
    const trivial = new Set(['ok', 'thanks', 'thank you', 'got it', 'yes', 'no', 'sure', 'cool', 'great']);
    for (let i = thread.messages.length - 1; i >= 0; i--) {
      const msg = thread.messages[i];
      if (msg.role === 'seller' && !trivial.has(msg.content.toLowerCase().trim().replace(/[.!?]/g, ''))) {
        return msg.content;
      }
    }
    if (thread.decisionChips.length > 0) {
      return thread.decisionChips.join('; ');
    }
    for (let i = thread.messages.length - 1; i >= 0; i--) {
      if (thread.messages[i].role === 'agent') return thread.messages[i].content;
    }
    return null;
  })();

  const scopeChipLabel = thread.scopeLabel || thread.scope.territory || null;

  const handleRenameSubmit = () => {
    if (renameValue.trim()) renameThread(thread.id, renameValue.trim());
    setRenaming(false);
  };

  const handleDelete = () => {
    deleteThread(thread.id);
    selectThread(null);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setMoveExpanded(false);
  };

  return (
    <div
      className={`group relative flex cursor-pointer flex-col gap-[3px] px-[16px] py-[10px] transition-colors ${
        selected
          ? 'border-l-[3px] border-l-li-blue bg-li-bg-selected'
          : 'border-l-[3px] border-l-transparent hover:bg-li-bg-hover'
      }`}
      style={{ borderBottom: '1px solid var(--border-standard)' }}
      onClick={onClick}
    >
      {/* Row 1: title + timestamp */}
      <div className="flex items-center gap-[6px]">
        {thread.pinned && (
          <Pin size={11} className="shrink-0 text-li-text-tertiary" />
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
            {thread.title}
          </span>
        )}
        <span className="shrink-0 font-body text-[11px] text-li-text-tertiary">
          {relativeTime(thread.updatedAt)}
        </span>
      </div>

      {/* Row 2: recall line */}
      {recallLine && (
        <span className="truncate font-body text-[11px] text-li-text-tertiary">
          {recallLine}
        </span>
      )}

      {/* Row 3: chips (max 2) + subtle needs-review */}
      <div className="flex items-center gap-[4px]">
        <Badge type={thread.type} />
        {scopeChipLabel && <ScopeChip label={scopeChipLabel} />}
        {thread.needsReview && (
          <span className="ml-auto rounded-[3px] bg-li-bg-tertiary px-[5px] py-[1px] font-body text-[10px] text-li-text-tertiary opacity-0 transition-opacity group-hover:opacity-100">
            Needs review
          </span>
        )}
      </div>

      {/* Hover overflow button */}
      <div className="absolute bottom-[8px] right-[8px]">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
            setMoveExpanded(false);
          }}
          className="hidden rounded p-[3px] text-li-text-tertiary hover:bg-li-bg-hover group-hover:block"
        >
          <MoreHorizontal size={14} />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={(e) => { e.stopPropagation(); closeMenu(); }}
            />
            <div className="absolute bottom-full right-0 z-20 mb-[2px] flex w-[180px] flex-col rounded-ds-card border border-li-border-standard bg-white py-[4px] shadow-md">
              {/* Rename */}
              <OverflowAction
                icon={<Pencil size={12} />}
                label="Rename"
                onClick={() => {
                  setRenameValue(thread.title);
                  setRenaming(true);
                  closeMenu();
                }}
              />

              {/* Pin / Unpin */}
              <OverflowAction
                icon={thread.pinned ? <PinOff size={12} /> : <Pin size={12} />}
                label={thread.pinned ? 'Unpin' : 'Pin'}
                onClick={() => {
                  thread.pinned ? unpinThread(thread.id) : pinThread(thread.id);
                  closeMenu();
                }}
              />

              {/* Archive / Unarchive */}
              {thread.archived ? (
                <OverflowAction
                  icon={<ArchiveRestore size={12} />}
                  label="Unarchive"
                  onClick={() => { unarchiveThread(thread.id); closeMenu(); }}
                />
              ) : (
                <OverflowAction
                  icon={<Archive size={12} />}
                  label="Archive"
                  onClick={() => { archiveThread(thread.id); closeMenu(); }}
                />
              )}

              {/* Move to section — inline expandable (no flyout) */}
              {sections.length > 0 && (
                <>
                  <div className="my-[2px] border-t border-li-border-standard" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMoveExpanded(!moveExpanded);
                    }}
                    className="flex w-full items-center gap-[8px] px-[10px] py-[5px] text-left font-body text-ds-small text-li-text-primary transition-colors hover:bg-li-bg-hover"
                  >
                    <FolderInput size={12} />
                    <span className="flex-1">Move to section</span>
                    <ChevronDown
                      size={10}
                      className={`text-li-text-tertiary transition-transform ${moveExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {moveExpanded && (
                    <div className="flex flex-col py-[2px]">
                      {/* Remove from section */}
                      {thread.section && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setThreadSection(thread.id, undefined);
                            closeMenu();
                          }}
                          className="flex items-center gap-[6px] px-[18px] py-[4px] text-left font-body text-[11px] text-li-text-secondary transition-colors hover:bg-li-bg-hover"
                        >
                          <Undo2 size={10} />
                          <span>Remove from section</span>
                        </button>
                      )}
                      {sections.map((sec) => (
                        <button
                          key={sec.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setThreadSection(thread.id, sec.id);
                            closeMenu();
                          }}
                          className={`px-[18px] py-[4px] text-left font-body text-[11px] transition-colors hover:bg-li-bg-hover ${
                            thread.section === sec.id
                              ? 'font-semibold text-li-blue'
                              : 'text-li-text-primary'
                          }`}
                        >
                          {thread.section === sec.id ? `✓ ${sec.label}` : sec.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div className="my-[2px] border-t border-li-border-standard" />
              <OverflowAction
                icon={<Trash2 size={12} />}
                label="Delete"
                danger
                onClick={() => { handleDelete(); closeMenu(); }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function OverflowAction({
  icon,
  label,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
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
