import { useMemo, useState } from 'react';
import { useThreadStore } from '../../store/useThreadStore';
import { useAppStore } from '../../store/useAppStore';
import { useSectionStore } from '../../store/useSectionStore';
import SearchBox from '../ui/SearchBox';
import ThreadListItem from './ThreadListItem';
import {
  Plus,
  ChevronRight,
  FolderPlus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  Check,
} from 'lucide-react';

type QuickFilter = 'all' | 'pinned' | 'today' | 'week';

/** Helpers for time-based bucketing */
function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function startOfWeek(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.getTime();
}

export default function ThreadList() {
  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [searchFocused, setSearchFocused] = useState(false);

  const threadsById = useThreadStore((s) => s.threadsById);
  const threadOrder = useThreadStore((s) => s.threadOrder);
  const selectedThreadId = useAppStore((s) => s.selectedThreadId);
  const selectThread = useAppStore((s) => s.selectThread);
  const setCurrentEvidence = useAppStore((s) => s.setCurrentEvidence);
  const createThread = useThreadStore((s) => s.createThread);

  const sections = useSectionStore((s) => s.sections);
  const collapsed = useSectionStore((s) => s.collapsed);
  const toggleCollapsed = useSectionStore((s) => s.toggleCollapsed);
  const addSection = useSectionStore((s) => s.addSection);
  const renameSection = useSectionStore((s) => s.renameSection);
  const deleteSection = useSectionStore((s) => s.deleteSection);
  const moveSectionUp = useSectionStore((s) => s.moveSectionUp);
  const moveSectionDown = useSectionStore((s) => s.moveSectionDown);
  const setThreadSection = useThreadStore((s) => s.setThreadSection);

  // Local state for managing sections
  const [addingSectionName, setAddingSectionName] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionName, setEditingSectionName] = useState('');

  // Built-in bucket collapsed states
  const [pinnedCollapsed, setPinnedCollapsed] = useState(false);
  const [todayCollapsed, setTodayCollapsed] = useState(false);
  const [weekCollapsed, setWeekCollapsed] = useState(false);
  const [earlierCollapsed, setEarlierCollapsed] = useState(true);
  const [archivedCollapsed, setArchivedCollapsed] = useState(true);

  const threads = useMemo(
    () => threadOrder.map((id) => threadsById[id]).filter(Boolean),
    [threadsById, threadOrder]
  );

  // Text search
  const searchFiltered = useMemo(() => {
    if (!search.trim()) return threads;
    const q = search.toLowerCase();
    return threads.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.scope.territory || '').toLowerCase().includes(q) ||
        (t.scope.segment || '').toLowerCase().includes(q) ||
        (t.progressLine || '').toLowerCase().includes(q)
    );
  }, [threads, search]);

  // Quick filter
  const filtered = useMemo(() => {
    if (quickFilter === 'all') return searchFiltered;
    if (quickFilter === 'pinned') return searchFiltered.filter((t) => t.pinned);
    if (quickFilter === 'today') {
      const todayMs = startOfToday();
      return searchFiltered.filter((t) => new Date(t.updatedAt).getTime() >= todayMs);
    }
    if (quickFilter === 'week') {
      const weekMs = startOfWeek();
      return searchFiltered.filter((t) => new Date(t.updatedAt).getTime() >= weekMs);
    }
    return searchFiltered;
  }, [searchFiltered, quickFilter]);

  // Time-based buckets
  const todayMs = startOfToday();
  const weekMs = startOfWeek();

  // Threads in custom sections
  const customSectionThreads = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    sections.forEach((s) => {
      map[s.id] = filtered.filter((t) => t.section === s.id && !t.archived);
    });
    return map;
  }, [filtered, sections]);

  const threadsInCustomSections = new Set(
    sections.flatMap((s) => (customSectionThreads[s.id] || []).map((t) => t.id))
  );

  // Built-in buckets (excluding threads already in custom sections)
  const nonCustom = filtered.filter((t) => !threadsInCustomSections.has(t.id));
  const pinned = nonCustom.filter((t) => t.pinned && !t.archived);
  const unpinned = nonCustom.filter((t) => !t.pinned && !t.archived);
  const todayItems = unpinned.filter((t) => new Date(t.updatedAt).getTime() >= todayMs);
  const weekItems = unpinned.filter((t) => {
    const ts = new Date(t.updatedAt).getTime();
    return ts >= weekMs && ts < todayMs;
  });
  const earlierItems = unpinned.filter((t) => new Date(t.updatedAt).getTime() < weekMs);
  const archivedItems = nonCustom.filter((t) => t.archived);

  const handleSelect = (threadId: string) => {
    selectThread(threadId);
    const thread = threadsById[threadId];
    if (thread) {
      const lastAttach = [...thread.messages].reverse().find((m) => m.attachments?.length);
      if (lastAttach?.attachments?.[0]) {
        setCurrentEvidence(lastAttach.attachments[0].evidenceId);
      }
    }
  };

  const handleNewThread = () => {
    const id = createThread({ title: 'New thread', type: 'MIXED' });
    selectThread(id);
  };

  const handleAddSection = () => {
    if (addingSectionName.trim()) {
      addSection(addingSectionName.trim());
      setAddingSectionName('');
      setShowAddSection(false);
    }
  };

  const handleRenameSection = (id: string) => {
    if (editingSectionName.trim()) {
      renameSection(id, editingSectionName.trim());
    }
    setEditingSectionId(null);
  };

  const handleDeleteSection = (sectionId: string) => {
    const threadsInSection = filtered.filter((t) => t.section === sectionId);
    threadsInSection.forEach((t) => setThreadSection(t.id, undefined));
    deleteSection(sectionId);
  };

  const showBuckets = quickFilter === 'all' && !search.trim();

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="flex h-full flex-col">
      {/* Search + new thread */}
      <div className="flex shrink-0 flex-col gap-[6px] px-[12px] py-[10px]">
        <div className="flex items-center gap-[6px]">
          <div
            className="flex-1"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
          >
            <SearchBox value={search} onChange={setSearch} placeholder="Search threads..." />
          </div>
          <button
            onClick={handleNewThread}
            className="flex shrink-0 items-center gap-[4px] rounded-ds-button border border-li-blue bg-white px-[10px] py-[4px] font-body text-ds-small font-semibold text-li-blue transition-colors hover:bg-li-blue hover:text-white"
          >
            <Plus size={13} />
            <span>New thread</span>
          </button>
        </div>

        {/* Quick filter chips */}
        {(searchFocused || search || quickFilter !== 'all') && (
          <div className="flex items-center gap-[4px]">
            {(['all', 'pinned', 'today', 'week'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setQuickFilter(f)}
                className={`rounded-[4px] px-[8px] py-[2px] font-body text-[11px] font-medium transition-colors ${
                  quickFilter === f
                    ? 'bg-li-text-primary text-white'
                    : 'bg-li-bg-tertiary text-li-text-secondary hover:bg-li-bg-hover'
                }`}
              >
                {f === 'all' ? 'All' : f === 'pinned' ? 'Pinned' : f === 'today' ? 'Today' : 'This week'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Thread list (scrollable) */}
      <div className="flex-1 overflow-y-auto li-scrollbar">
        {showBuckets ? (
          <>
            {/* Built-in: Pinned */}
            {pinned.length > 0 && (
              <CollapsibleBucket
                label="Pinned"
                count={pinned.length}
                collapsed={pinnedCollapsed}
                onToggle={() => setPinnedCollapsed(!pinnedCollapsed)}
              >
                {pinned.map((t) => (
                  <ThreadListItem key={t.id} thread={t} selected={selectedThreadId === t.id} onClick={() => handleSelect(t.id)} />
                ))}
              </CollapsibleBucket>
            )}

            {/* Built-in: Today */}
            {todayItems.length > 0 && (
              <CollapsibleBucket
                label="Today"
                count={todayItems.length}
                collapsed={todayCollapsed}
                onToggle={() => setTodayCollapsed(!todayCollapsed)}
              >
                {todayItems.map((t) => (
                  <ThreadListItem key={t.id} thread={t} selected={selectedThreadId === t.id} onClick={() => handleSelect(t.id)} />
                ))}
              </CollapsibleBucket>
            )}

            {/* Built-in: This week */}
            {weekItems.length > 0 && (
              <CollapsibleBucket
                label="This week"
                count={weekItems.length}
                collapsed={weekCollapsed}
                onToggle={() => setWeekCollapsed(!weekCollapsed)}
              >
                {weekItems.map((t) => (
                  <ThreadListItem key={t.id} thread={t} selected={selectedThreadId === t.id} onClick={() => handleSelect(t.id)} />
                ))}
              </CollapsibleBucket>
            )}

            {/* Custom sections */}
            {sortedSections.map((sec, idx) => {
              const items = customSectionThreads[sec.id] || [];
              return (
                <CollapsibleBucket
                  key={sec.id}
                  label={sec.label}
                  count={items.length}
                  collapsed={!!collapsed[sec.id]}
                  onToggle={() => toggleCollapsed(sec.id)}
                  editable
                  editing={editingSectionId === sec.id}
                  editValue={editingSectionName}
                  onEditStart={() => {
                    setEditingSectionId(sec.id);
                    setEditingSectionName(sec.label);
                  }}
                  onEditChange={setEditingSectionName}
                  onEditSubmit={() => handleRenameSection(sec.id)}
                  onEditCancel={() => setEditingSectionId(null)}
                  onDelete={() => handleDeleteSection(sec.id)}
                  onMoveUp={idx > 0 ? () => moveSectionUp(sec.id) : undefined}
                  onMoveDown={idx < sortedSections.length - 1 ? () => moveSectionDown(sec.id) : undefined}
                >
                  {items.length === 0 ? (
                    <div className="px-[16px] py-[10px] font-body text-[11px] text-li-text-tertiary">
                      No threads — move threads here from the thread menu.
                    </div>
                  ) : (
                    items.map((t) => (
                      <ThreadListItem key={t.id} thread={t} selected={selectedThreadId === t.id} onClick={() => handleSelect(t.id)} />
                    ))
                  )}
                </CollapsibleBucket>
              );
            })}

          </>
        ) : (
          filtered.map((t) => (
            <ThreadListItem key={t.id} thread={t} selected={selectedThreadId === t.id} onClick={() => handleSelect(t.id)} />
          ))
        )}

        {filtered.length === 0 && (
          <div className="px-[16px] py-[24px] text-center font-body text-ds-small text-li-text-tertiary">
            No threads found.
          </div>
        )}

        {/* New section — bottom right of scrollable area */}
        {showBuckets && (
          <div className="flex justify-end px-[12px] py-[6px]">
            {!showAddSection ? (
              <button
                onClick={() => setShowAddSection(true)}
                className="flex items-center gap-[3px] rounded px-[6px] py-[3px] font-body text-[11px] text-li-text-tertiary transition-colors hover:bg-li-bg-hover hover:text-li-text-secondary"
              >
                <FolderPlus size={11} />
                <span>New section</span>
              </button>
            ) : (
              <div className="flex items-center gap-[4px]">
                <input
                  autoFocus
                  value={addingSectionName}
                  onChange={(e) => setAddingSectionName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddSection();
                    if (e.key === 'Escape') {
                      setShowAddSection(false);
                      setAddingSectionName('');
                    }
                  }}
                  placeholder="Section name"
                  className="w-[120px] rounded border border-li-border-standard bg-white px-[6px] py-[2px] font-body text-[11px] text-li-text-primary outline-none focus:border-li-blue"
                />
                <button
                  onClick={handleAddSection}
                  className="rounded p-[2px] text-li-blue hover:bg-li-bg-hover"
                  title="Create section"
                >
                  <Check size={11} />
                </button>
                <button
                  onClick={() => {
                    setShowAddSection(false);
                    setAddingSectionName('');
                  }}
                  className="rounded p-[2px] text-li-text-tertiary hover:bg-li-bg-hover"
                  title="Cancel"
                >
                  <X size={11} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom-pinned: Earlier + Archived */}
      {showBuckets && (earlierItems.length > 0 || archivedItems.length > 0) && (
        <div className="shrink-0" style={{ borderTop: '1px solid var(--border-standard)' }}>
          {earlierItems.length > 0 && (
            <CollapsibleBucket
              label="Earlier"
              count={earlierItems.length}
              collapsed={earlierCollapsed}
              onToggle={() => setEarlierCollapsed(!earlierCollapsed)}
              maxHeight={200}
            >
              {earlierItems.map((t) => (
                <ThreadListItem key={t.id} thread={t} selected={selectedThreadId === t.id} onClick={() => handleSelect(t.id)} />
              ))}
            </CollapsibleBucket>
          )}

          {archivedItems.length > 0 && (
            <CollapsibleBucket
              label="Archived"
              count={archivedItems.length}
              collapsed={archivedCollapsed}
              onToggle={() => setArchivedCollapsed(!archivedCollapsed)}
              maxHeight={200}
            >
              {archivedItems.map((t) => (
                <ThreadListItem key={t.id} thread={t} selected={selectedThreadId === t.id} onClick={() => handleSelect(t.id)} />
              ))}
            </CollapsibleBucket>
          )}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────── CollapsibleBucket ────────────────────────── */

interface CollapsibleBucketProps {
  label: string;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
  maxHeight?: number;
  children: React.ReactNode;
  /** Custom section support */
  editable?: boolean;
  editing?: boolean;
  editValue?: string;
  onEditStart?: () => void;
  onEditChange?: (v: string) => void;
  onEditSubmit?: () => void;
  onEditCancel?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

function CollapsibleBucket({
  label,
  count,
  collapsed,
  onToggle,
  maxHeight,
  children,
  editable,
  editing,
  editValue,
  onEditStart,
  onEditChange,
  onEditSubmit,
  onEditCancel,
  onDelete,
  onMoveUp,
  onMoveDown,
}: CollapsibleBucketProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      <div className="group/bucket flex items-center gap-[2px] px-[16px] py-[5px]">
        <button
          onClick={onToggle}
          className="flex items-center gap-[4px] text-left"
        >
          <ChevronRight
            size={11}
            className={`text-li-text-tertiary transition-transform ${collapsed ? '' : 'rotate-90'}`}
          />
          {editing ? (
            <input
              autoFocus
              value={editValue || ''}
              onChange={(e) => onEditChange?.(e.target.value)}
              onBlur={() => onEditSubmit?.()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onEditSubmit?.();
                if (e.key === 'Escape') onEditCancel?.();
              }}
              onClick={(e) => e.stopPropagation()}
              className="min-w-0 rounded border border-li-blue bg-white px-[4px] py-[0px] font-body text-[11px] font-semibold uppercase tracking-wider text-li-text-primary outline-none"
            />
          ) : (
            <span className="font-body text-[11px] font-semibold uppercase tracking-wider text-li-text-tertiary">
              {label}
            </span>
          )}
          <span className="font-body text-[11px] text-li-text-tertiary">
            ({count})
          </span>
        </button>

        {/* Overflow menu for custom sections only */}
        {editable && !editing && (
          <div className="relative ml-auto opacity-0 transition-opacity group-hover/bucket:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="rounded p-[2px] text-li-text-tertiary hover:bg-li-bg-hover"
              title="Section options"
            >
              <MoreHorizontal size={12} />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-[2px] flex w-[150px] flex-col rounded-ds-card border border-li-border-standard bg-white py-[4px] shadow-md">
                  <SectionMenuAction
                    icon={<Pencil size={11} />}
                    label="Rename"
                    onClick={() => {
                      onEditStart?.();
                      setMenuOpen(false);
                    }}
                  />
                  {onMoveUp && (
                    <SectionMenuAction
                      icon={<ArrowUp size={11} />}
                      label="Move up"
                      onClick={() => {
                        onMoveUp();
                        setMenuOpen(false);
                      }}
                    />
                  )}
                  {onMoveDown && (
                    <SectionMenuAction
                      icon={<ArrowDown size={11} />}
                      label="Move down"
                      onClick={() => {
                        onMoveDown();
                        setMenuOpen(false);
                      }}
                    />
                  )}
                  <div className="my-[2px] border-t border-li-border-standard" />
                  <SectionMenuAction
                    icon={<Trash2 size={11} />}
                    label="Delete section"
                    danger
                    onClick={() => {
                      onDelete?.();
                      setMenuOpen(false);
                    }}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {!collapsed && (
        <div
          className={maxHeight ? 'overflow-y-auto li-scrollbar' : undefined}
          style={maxHeight ? { maxHeight } : undefined}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function SectionMenuAction({
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
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`flex items-center gap-[6px] px-[10px] py-[4px] text-left font-body text-[11px] transition-colors hover:bg-li-bg-hover ${
        danger ? 'text-[#CC1016]' : 'text-li-text-primary'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
