import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { Evidence, PrioritizedAccountRow, FilterChip, ExtraColumn } from '../../types/evidence';
import { useAppStore } from '../../store/useAppStore';
import { useJobStore } from '../../store/useJobStore';
import { useEvidenceStore } from '../../store/useEvidenceStore';
import { processSellerMessage } from '../../flows/engine';
import EvidenceHeader from './EvidenceHeader';
import { Users, MoreHorizontal, EyeOff, Plus, GripVertical, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  evidence: Evidence;
  hideHeader?: boolean;
}

// ── Column definitions ──────────────────────────────────────────

interface ColumnDef {
  id: string;
  label: string;
  width: string;
  isExtra?: boolean;
}

const BASE_COLUMNS: ColumnDef[] = [
  { id: 'account', label: 'Account', width: '180px' },
  { id: 'industry', label: 'Industry', width: '160px' },
  { id: 'location', label: 'Location', width: '160px' },
  { id: 'primarySignal', label: 'Primary Signal', width: '260px' },
];

// ── Signal styling ──────────────────────────────────────────────

const SIGNAL_COLORS: Record<string, string> = {
  leadership: 'bg-[#EDE7F6] text-[#7C3AED] border-[#D1C4E9]',
  funding: 'bg-[#E3F2FD] text-[#1565C0] border-[#BBDEFB]',
  engagement: 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]',
  tech_fit: 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]',
  expansion: 'bg-[#F3E5F5] text-[#6A1B9A] border-[#E1BEE7]',
};

const SIGNAL_TYPE_LABELS: Record<string, string> = {
  leadership: 'Leadership change',
  funding: 'Recent funding',
  engagement: 'High engagement',
  tech_fit: 'Tech alignment',
  expansion: 'Expansion',
};

const FILTER_TAG_LABELS: Record<string, string> = {
  'leadership-change': 'Leadership change',
  'recent-funding': 'Recent funding',
  'high-engagement': 'High engagement',
  'tech-alignment': 'Tech alignment',
  'not-touched-30d': 'Not touched in 30 days',
  'crm-active': 'Active CRM opportunity',
  'hiring-surge': 'Hiring surge',
  'expansion': 'Expansion',
  // Dimensional tags
  'region-bay-area': 'Bay Area',
  'region-west': 'West Coast',
  'region-northeast': 'Northeast',
  'region-south': 'South',
  'region-midwest': 'Midwest',
  'industry-ai': 'AI/ML',
  'industry-saas': 'SaaS',
  'industry-fintech': 'FinTech',
  'industry-healthtech': 'HealthTech',
  'industry-enterprise-sw': 'Enterprise Software',
  'industry-cloud': 'Cloud',
  'size-startup': '1–50 employees',
  'size-small': '51–200 employees',
  'size-midsize': '201–500 employees',
  'size-growth': '501–1,000 employees',
  'size-enterprise': '1,000+ employees',
};

// ── Column header menu ──────────────────────────────────────────

function ColumnMenu({
  columnId,
  hiddenColumns,
  onHide,
  onAdd,
}: {
  columnId: string;
  hiddenColumns: ColumnDef[];
  onHide: (id: string) => void;
  onAdd: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowAdd(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); setShowAdd(false); }}
        className="flex items-center justify-center rounded-[3px] p-[2px] text-li-text-disabled opacity-0 transition-opacity group-hover/col:opacity-100 hover:bg-li-bg-hover hover:text-li-text-secondary"
      >
        <MoreHorizontal size={14} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+2px)] z-50 w-[180px] rounded-[8px] border border-li-border-standard bg-white py-[4px] shadow-lg">
          <button
            className="flex w-full items-center gap-[8px] px-[12px] py-[6px] text-left font-body text-ds-small text-li-text-primary hover:bg-li-bg-hover"
            onClick={() => { onHide(columnId); setOpen(false); }}
          >
            <EyeOff size={13} className="text-li-text-tertiary" />
            Hide column
          </button>

          {hiddenColumns.length > 0 && (
            <div className="relative">
              <button
                className="flex w-full items-center gap-[8px] px-[12px] py-[6px] text-left font-body text-ds-small text-li-text-primary hover:bg-li-bg-hover"
                onClick={() => setShowAdd((v) => !v)}
              >
                <Plus size={13} className="text-li-text-tertiary" />
                Add column
                <span className="ml-auto text-li-text-disabled">›</span>
              </button>

              {showAdd && (
                <div className="absolute left-full top-0 z-50 ml-[2px] w-[180px] rounded-[8px] border border-li-border-standard bg-white py-[4px] shadow-lg">
                  {hiddenColumns.map((col) => (
                    <button
                      key={col.id}
                      className="flex w-full items-center px-[12px] py-[6px] text-left font-body text-ds-small text-li-text-primary hover:bg-li-bg-hover"
                      onClick={() => { onAdd(col.id); setOpen(false); setShowAdd(false); }}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────

export default function AccountsPrioritized({ evidence, hideHeader }: Props) {
  const selectedJobId = useAppStore((s) => s.selectedJobId);
  const addMessage = useJobStore((s) => s.addMessage);
  const updateEvidence = useEvidenceStore((s) => s.updateEvidence);

  const allAccounts = (evidence.accountsPrioritized || []) as PrioritizedAccountRow[];
  const explicitChips = (evidence.filterChips || []) as FilterChip[];
  const findLeadsLabel = evidence.findLeadsLabel || 'Next: Find leads in these accounts';
  const extraColumns = (evidence.extraColumns || []) as ExtraColumn[];
  const bookSize = evidence.bookSize || 0;

  // Quick play: card-specific evidence where pre-applied filters ARE the root context.
  // No "Your book" or "X prioritized" — breadcrumbs start with the card's context filters.
  const isQuickPlay = evidence.id.startsWith('ev_quick_');

  // ── Build full column catalogue ───────────────────────────────
  const allColumns = useMemo<ColumnDef[]>(() => {
    const extras: ColumnDef[] = extraColumns.map((col) => ({
      id: col.id,
      label: col.label,
      width: col.width || '180px',
      isExtra: true,
    }));
    return [...BASE_COLUMNS, ...extras];
  }, [extraColumns]);

  // Column order & visibility — seed with all columns visible
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    allColumns.map((c) => c.id)
  );
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  // When extraColumns change, add any new ones not yet in the order
  useEffect(() => {
    setColumnOrder((prev) => {
      const existing = new Set(prev);
      const toAdd = allColumns.filter((c) => !existing.has(c.id)).map((c) => c.id);
      return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
    });
  }, [allColumns]);

  const visibleColumns = useMemo(
    () => columnOrder.filter((id) => !hiddenIds.has(id)).map((id) => allColumns.find((c) => c.id === id)!).filter(Boolean),
    [columnOrder, hiddenIds, allColumns]
  );

  const hiddenColumns = useMemo(
    () => allColumns.filter((c) => hiddenIds.has(c.id)),
    [allColumns, hiddenIds]
  );

  const hideColumn = useCallback((id: string) => {
    setHiddenIds((prev) => new Set([...prev, id]));
  }, []);

  const showColumn = useCallback((id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // ── Drag-and-drop reorder ─────────────────────────────────────
  const dragColRef = useRef<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const handleDragStart = (colId: string) => {
    dragColRef.current = colId;
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    if (dragColRef.current && dragColRef.current !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDrop = (targetColId: string) => {
    const srcId = dragColRef.current;
    if (!srcId || srcId === targetColId) { dragColRef.current = null; setDragOverCol(null); return; }

    setColumnOrder((prev) => {
      const next = prev.filter((id) => id !== srcId);
      const targetIdx = next.indexOf(targetColId);
      next.splice(targetIdx, 0, srcId);
      return next;
    });
    dragColRef.current = null;
    setDragOverCol(null);
  };

  const handleDragEnd = () => {
    dragColRef.current = null;
    setDragOverCol(null);
  };

  // ── Filter chips ──────────────────────────────────────────────
  const filterChips: FilterChip[] = useMemo(() => {
    if (explicitChips.length > 0) return explicitChips;

    const tagCounts = new Map<string, number>();
    for (const a of allAccounts) {
      for (const tag of a.filterTags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    const typeCounts = new Map<string, number>();
    for (const a of allAccounts) {
      typeCounts.set(a.signalType, (typeCounts.get(a.signalType) || 0) + 1);
    }

    const chips: FilterChip[] = [];
    const coveredTypes = new Set<string>();
    const tagToType: Record<string, string> = {
      'leadership-change': 'leadership',
      'recent-funding': 'funding',
      'high-engagement': 'engagement',
      'tech-alignment': 'tech_fit',
    };

    for (const [tag, count] of tagCounts) {
      chips.push({ id: tag, label: FILTER_TAG_LABELS[tag] || tag, count });
      if (tagToType[tag]) coveredTypes.add(tagToType[tag]);
    }

    for (const [type, count] of typeCounts) {
      if (!coveredTypes.has(type)) {
        chips.push({ id: type, label: SIGNAL_TYPE_LABELS[type] || type, count });
      }
    }

    chips.sort((a, b) => b.count - a.count);
    return chips;
  }, [explicitChips, allAccounts]);

  // ── Filter breadcrumb stack ──────────────────────────────────
  const [filterStack, setFilterStack] = useState<string[]>(
    () => (evidence.appliedFilters || [])
  );
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Sync filterStack when evidence changes (e.g., engine applies filters via chat)
  // Watch both evidence.id AND appliedFilters so stacked filters on the same evidence ID work
  const appliedFiltersKey = (evidence.appliedFilters || []).join(',');
  useEffect(() => {
    setFilterStack(evidence.appliedFilters || []);
  }, [evidence.id, appliedFiltersKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Progressive filtering — each filter narrows the previous result set
  const { filteredAccounts, breadcrumbs, availableFilters } = useMemo(() => {
    let current = allAccounts;
    const crumbs: { id: string; label: string; count: number }[] = [];

    for (const filterId of filterStack) {
      current = current.filter(
        (a) => a.filterTags.includes(filterId) || a.signalType === filterId
      );
      const chip = filterChips.find((c) => c.id === filterId);
      crumbs.push({
        id: filterId,
        label: chip?.label || filterId,
        count: current.length,
      });
    }

    // Available next filters — only those that would yield results
    const available = filterChips
      .filter((c) => !filterStack.includes(c.id))
      .map((c) => ({
        ...c,
        projectedCount: current.filter(
          (a) => a.filterTags.includes(c.id) || a.signalType === c.id
        ).length,
      }))
      .filter((c) => c.projectedCount > 0);

    return { filteredAccounts: current, breadcrumbs: crumbs, availableFilters: available };
  }, [allAccounts, filterStack, filterChips]);

  const addFilter = (id: string) => {
    const newStack = [...filterStack, id];
    setFilterStack(newStack);
    // Write back to evidence store so the engine always knows the current filters
    updateEvidence(evidence.id, { appliedFilters: newStack });
  };

  const revertTo = (index: number) => {
    // index = -1 means revert to base (clear all)
    const newStack = index < 0 ? [] : filterStack.slice(0, index + 1);
    setFilterStack(newStack);
    updateEvidence(evidence.id, { appliedFilters: newStack });
  };

  const toggleSelect = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === filteredAccounts.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredAccounts.map((a) => a.id)));
    }
  };

  const handleFindLeads = () => {
    if (!selectedJobId) return;
    const msg = `Find leads in these ${filteredAccounts.length} prioritized accounts`;
    addMessage(selectedJobId, {
      id: `msg_${Date.now()}`,
      role: 'seller',
      timestamp: new Date().toISOString(),
      content: msg,
    });
    setTimeout(() => processSellerMessage(selectedJobId, msg), 100);
  };

  // ── Cell renderer ─────────────────────────────────────────────
  const renderCell = (col: ColumnDef, row: PrioritizedAccountRow) => {
    switch (col.id) {
      case 'account':
        return (
          <div className="flex items-baseline gap-[8px] truncate" title={`${row.company} · ${row.employees}`}>
            <span className="font-body text-ds-small font-semibold text-li-text-primary truncate">
              {row.company}
            </span>
            <span className="font-body text-ds-small text-li-text-disabled shrink-0">
              {row.employees}
            </span>
          </div>
        );
      case 'industry':
        return (
          <span className="block truncate font-body text-ds-small text-li-text-secondary" title={row.industry}>
            {row.industry}
          </span>
        );
      case 'location':
        return (
          <span className="block truncate font-body text-ds-small text-li-text-secondary" title={row.location}>
            {row.location}
          </span>
        );
      case 'primarySignal': {
        const signalColor = SIGNAL_COLORS[row.signalType] || 'bg-li-tag-bg text-li-text-tertiary border-li-border-standard';
        return (
          <span
            className={clsx('inline-flex max-w-full truncate rounded-full border px-[8px] py-[2px] font-body text-ds-small font-semibold leading-tight', signalColor)}
            title={row.primarySignal}
          >
            {row.primarySignal}
          </span>
        );
      }
      default:
        // Extra (dynamic) columns — plain text, matching Industry/Location style
        if (col.isExtra && row.extraData?.[col.id]) {
          return (
            <span className="block truncate font-body text-ds-small text-li-text-secondary" title={row.extraData[col.id]}>
              {row.extraData[col.id]}
            </span>
          );
        }
        return <span className="text-li-text-disabled">—</span>;
    }
  };

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col">
      {!hideHeader && (
        <EvidenceHeader breadcrumb="Agent • Account Prioritization" title={evidence.title} />
      )}

      {/* Filter breadcrumb bar + CTA */}
      <div
        className="flex shrink-0 items-center gap-[2px] bg-white px-[24px] py-[10px]"
        style={{ borderBottom: '1px solid var(--border-standard)' }}
      >
        {/* Breadcrumb trail */}
        <div className="flex items-center gap-[2px] overflow-hidden">
          {/* Book crumb — only for non-quick-play evidence */}
          {bookSize > 0 && !isQuickPlay && (
            <>
              <span className="shrink-0 whitespace-nowrap rounded-[4px] px-[6px] py-[2px] font-body text-ds-small text-li-text-disabled">
                Your book · {bookSize}
              </span>
              <ChevronRight size={12} className="shrink-0 text-li-text-disabled" />
            </>
          )}

          {/* Prioritized accounts crumb — hidden for quick play (pre-filters are the root) */}
          {!isQuickPlay && (
            <button
              onClick={() => revertTo(-1)}
              className={clsx(
                'shrink-0 whitespace-nowrap rounded-[4px] px-[6px] py-[2px] font-body text-ds-small transition-colors',
                filterStack.length === 0
                  ? 'font-semibold text-li-text-primary'
                  : 'text-li-text-secondary hover:bg-li-bg-hover hover:text-li-text-primary'
              )}
            >
              {allAccounts.length} prioritized
            </button>
          )}

          {/* Applied filter crumbs */}
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb.id} className="flex items-center gap-[2px]">
              {/* Hide chevron before first crumb in quick play (it's the root) */}
              {(i > 0 || !isQuickPlay) && (
                <ChevronRight size={12} className="shrink-0 text-li-text-disabled" />
              )}
              <button
                onClick={() => {
                  // If it's the last crumb, clicking removes it (goes back one step)
                  if (i === breadcrumbs.length - 1) {
                    revertTo(i - 1);
                  } else {
                    revertTo(i);
                  }
                }}
                className={clsx(
                  'shrink-0 whitespace-nowrap rounded-[4px] px-[6px] py-[2px] font-body text-ds-small transition-colors',
                  i === breadcrumbs.length - 1
                    ? 'font-semibold text-li-text-primary'
                    : 'text-li-text-secondary hover:bg-li-bg-hover hover:text-li-text-primary'
                )}
              >
                {crumb.label}
                <span className="ml-[3px] text-li-text-disabled">· {crumb.count}</span>
              </button>
            </div>
          ))}

          {/* Available next filters — inline after breadcrumbs */}
          {availableFilters.length > 0 && (
            <>
              <ChevronRight size={12} className="shrink-0 text-li-text-disabled" />
              <div className="flex items-center gap-[4px]">
                {availableFilters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => addFilter(f.id)}
                    className="shrink-0 whitespace-nowrap rounded-full border border-dashed border-li-border-standard px-[8px] py-[2px] font-body text-ds-small text-li-text-tertiary transition-all hover:border-li-blue hover:bg-li-blue/5 hover:text-li-blue"
                  >
                    {f.label}
                    <span className="ml-[3px] opacity-60">· {f.projectedCount}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleFindLeads}
          className="ml-auto shrink-0 flex items-center gap-[6px] rounded-[8px] bg-li-blue px-[14px] py-[7px] font-body text-ds-small font-semibold text-white shadow-sm transition-all hover:bg-li-blue-dark hover:shadow-md"
        >
          <Users size={14} />
          {findLeadsLabel}
        </button>
      </div>

      {/* Accounts table */}
      <div className="flex-1 overflow-auto li-scrollbar">
        <table className="min-w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-white">
            <tr style={{ borderBottom: '2px solid var(--border-standard)' }}>
              {/* Checkbox header — always first, not draggable */}
              <th className="w-[44px] pl-[24px] pr-[4px] py-[8px] text-left align-middle">
                <input
                  type="checkbox"
                  checked={selectedRows.size === filteredAccounts.length && filteredAccounts.length > 0}
                  onChange={toggleAll}
                  className="accent-li-blue cursor-pointer"
                />
              </th>

              {/* Data columns — with menu & drag handle */}
              {visibleColumns.map((col) => (
                <th
                  key={col.id}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDrop={() => handleDrop(col.id)}
                  onDragEnd={handleDragEnd}
                  className={clsx(
                    'group/col relative px-[12px] py-[8px] text-left font-body text-ds-small font-semibold uppercase tracking-wide select-none',
                    col.isExtra ? 'text-li-blue' : 'text-li-text-tertiary',
                    dragOverCol === col.id && 'bg-li-bg-hover'
                  )}
                  style={{ width: col.width, animation: col.isExtra ? 'fadeIn 0.4s ease-out' : undefined }}
                >
                  {/* Label — directly in cell, aligned with body text */}
                  <span className="block truncate">{col.label}</span>

                  {/* Drag handle — top center, only visible on hover */}
                  <div
                    draggable
                    onDragStart={(e) => { e.stopPropagation(); handleDragStart(col.id); }}
                    className="absolute left-1/2 top-0 -translate-x-1/2 cursor-grab opacity-0 transition-opacity group-hover/col:opacity-100 active:cursor-grabbing"
                  >
                    <GripVertical size={10} className="rotate-90 text-li-text-disabled" />
                  </div>

                  {/* Column menu — top right, only visible on hover */}
                  <div className="absolute right-[4px] top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover/col:opacity-100">
                    <ColumnMenu
                      columnId={col.id}
                      hiddenColumns={hiddenColumns}
                      onHide={hideColumn}
                      onAdd={showColumn}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((row) => (
              <tr
                key={row.id}
                className={clsx(
                  'transition-colors hover:bg-li-bg-hover',
                  selectedRows.has(row.id) && 'bg-li-bg-selected'
                )}
                style={{ borderBottom: '1px solid var(--border-standard)' }}
              >
                <td className="w-[44px] pl-[24px] pr-[4px] py-[10px] align-middle">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(row.id)}
                    onChange={() => toggleSelect(row.id)}
                    className="accent-li-blue"
                  />
                </td>
                {visibleColumns.map((col) => (
                  <td
                    key={col.id}
                    className="px-[12px] py-[10px]"
                    style={{ width: col.width }}
                  >
                    {renderCell(col, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
