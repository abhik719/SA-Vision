import { useState } from 'react';
import type { Thread } from '../../types/thread';
import { useAppStore } from '../../store/useAppStore';
import { useThreadStore } from '../../store/useThreadStore';
import { useSectionStore } from '../../store/useSectionStore';
import Badge from '../ui/Badge';
import ScopeChip from '../ui/ScopeChip';
import {
  ArrowLeft,
  MoreHorizontal,
  Pin,
  PinOff,
  Pencil,
  Archive,
  Trash2,
  FolderInput,
  ChevronRight,
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
}

export default function ThreadContextStrip({ thread }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moveSubmenuOpen, setMoveSubmenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(thread.title);

  const pinThread = useThreadStore((s) => s.pinThread);
  const unpinThread = useThreadStore((s) => s.unpinThread);
  const renameThread = useThreadStore((s) => s.renameThread);
  const deleteThread = useThreadStore((s) => s.deleteThread);
  const archiveThread = useThreadStore((s) => s.archiveThread);
  const setThreadSection = useThreadStore((s) => s.setThreadSection);
  const selectThread = useAppStore((s) => s.selectThread);
  const sections = useSectionStore((s) => s.sections);

  const handleRenameSubmit = () => {
    if (renameValue.trim()) renameThread(thread.id, renameValue.trim());
    setRenaming(false);
  };

  const handleDelete = () => {
    deleteThread(thread.id);
    selectThread(null);
  };

  const handleArchive = () => {
    archiveThread(thread.id);
    selectThread(null);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setMoveSubmenuOpen(false);
  };

  return (
    <div
      className="shrink-0 bg-white"
      style={{ borderBottom: '1px solid var(--border-standard)' }}
    >
      {/* Row 1: ← Title  (timestamp + ⋯) */}
      <div className="flex items-center gap-[8px] px-[12px] pt-[10px] pb-[2px]">
        <button
          onClick={() => selectThread(null)}
          className="shrink-0 rounded p-[3px] text-li-text-tertiary hover:bg-li-bg-hover"
          title="Back to threads"
        >
          <ArrowLeft size={14} />
        </button>

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
            className="min-w-0 flex-1 rounded border border-li-blue bg-white px-[4px] py-[1px] font-body text-ds-base font-semibold text-li-text-primary outline-none"
          />
        ) : (
          <span
            className="flex-1 truncate font-body text-ds-base font-semibold text-li-text-primary"
            onDoubleClick={() => {
              setRenameValue(thread.title);
              setRenaming(true);
            }}
          >
            {thread.pinned && (
              <Pin size={11} className="mr-[4px] inline-block text-li-text-tertiary" style={{ verticalAlign: 'middle' }} />
            )}
            {thread.title}
          </span>
        )}

        <span className="shrink-0 font-body text-[11px] text-li-text-tertiary">
          {relativeTime(thread.updatedAt)}
        </span>

        {/* Overflow menu trigger */}
        <div className="relative shrink-0">
          <button
            onClick={() => {
              setMenuOpen(!menuOpen);
              setMoveSubmenuOpen(false);
            }}
            className="rounded p-[3px] text-li-text-tertiary hover:bg-li-bg-hover"
          >
            <MoreHorizontal size={14} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={closeMenu} />
              <div className="absolute right-0 top-full z-20 mt-[4px] flex w-[170px] flex-col rounded-ds-card border border-li-border-standard bg-white py-[4px] shadow-md">
                <MenuAction
                  icon={<Pencil size={13} />}
                  label="Rename"
                  onClick={() => {
                    setRenameValue(thread.title);
                    setRenaming(true);
                    closeMenu();
                  }}
                />
                <MenuAction
                  icon={thread.pinned ? <PinOff size={13} /> : <Pin size={13} />}
                  label={thread.pinned ? 'Unpin' : 'Pin'}
                  onClick={() => {
                    thread.pinned ? unpinThread(thread.id) : pinThread(thread.id);
                    closeMenu();
                  }}
                />

                {sections.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setMoveSubmenuOpen(!moveSubmenuOpen)}
                      className="flex w-full items-center gap-[8px] px-[12px] py-[6px] text-left font-body text-ds-small text-li-text-primary transition-colors hover:bg-li-bg-hover"
                    >
                      <FolderInput size={13} />
                      <span className="flex-1">Move to</span>
                      <ChevronRight size={10} className="text-li-text-tertiary" />
                    </button>
                    {moveSubmenuOpen && (
                      <div className="absolute left-full top-0 z-30 ml-[2px] flex w-[150px] flex-col rounded-ds-card border border-li-border-standard bg-white py-[4px] shadow-md">
                        {thread.section && (
                          <button
                            onClick={() => { setThreadSection(thread.id, undefined); closeMenu(); }}
                            className="flex items-center gap-[6px] px-[10px] py-[5px] text-left font-body text-ds-small text-li-text-secondary transition-colors hover:bg-li-bg-hover"
                          >
                            <Undo2 size={10} />
                            <span>Default</span>
                          </button>
                        )}
                        {sections.map((sec) => (
                          <button
                            key={sec.id}
                            onClick={() => { setThreadSection(thread.id, sec.id); closeMenu(); }}
                            className={`px-[10px] py-[5px] text-left font-body text-ds-small transition-colors hover:bg-li-bg-hover ${
                              thread.section === sec.id ? 'font-semibold text-li-blue' : 'text-li-text-primary'
                            }`}
                          >
                            {sec.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <MenuAction icon={<Archive size={13} />} label="Archive" onClick={handleArchive} />
                <div className="my-[2px] border-t border-li-border-standard" />
                <MenuAction icon={<Trash2 size={13} />} label="Delete" danger onClick={() => { handleDelete(); closeMenu(); }} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Row 2: Chips (aligned with title, not with back arrow) */}
      <div className="flex items-center gap-[4px] pb-[10px] pl-[40px] pr-[16px]">
        <Badge type={thread.type} />
        {thread.scopeLabel && <ScopeChip label={thread.scopeLabel} />}
      </div>
    </div>
  );
}

function MenuAction({ icon, label, danger, onClick }: { icon: React.ReactNode; label: string; danger?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-[8px] px-[12px] py-[6px] text-left font-body text-ds-small transition-colors hover:bg-li-bg-hover ${
        danger ? 'text-[#CC1016]' : 'text-li-text-primary'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
