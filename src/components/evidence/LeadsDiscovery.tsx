import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { Evidence, DiscoveryLeadRow, FilterChip } from '../../types/evidence';
import { useAppStore } from '../../store/useAppStore';
import { useJobStore } from '../../store/useJobStore';
import { useEvidenceStore } from '../../store/useEvidenceStore';
import { processSellerMessage } from '../../flows/engine';
import EvidenceHeader from './EvidenceHeader';
import { MoreHorizontal, EyeOff, Plus, GripVertical, ChevronRight, Send } from 'lucide-react';
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
}

const BASE_COLUMNS: ColumnDef[] = [
  { id: 'name', label: 'Name', width: '180px' },
  { id: 'title', label: 'Title', width: '200px' },
  { id: 'company', label: 'Company', width: '160px' },
  { id: 'signal', label: 'Signal', width: '200px' },
];

// ── Signal styling ──────────────────────────────────────────────

const SIGNAL_COLORS: Record<string, string> = {
  job_change: 'bg-[#EDE7F6] text-[#7C3AED] border-[#D1C4E9]',
  engagement: 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]',
  intent: 'bg-[#E3F2FD] text-[#1565C0] border-[#BBDEFB]',
  tech_stack: 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]',
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

export default function LeadsDiscovery({ evidence, hideHeader }: Props) {
  const selectedJobId = useAppStore((s) => s.selectedJobId);
  const addMessage = useJobStore((s) => s.addMessage);
  const updateEvidence = useEvidenceStore((s) => s.updateEvidence);

  const allLeads = (evidence.leadsDiscovery || []) as DiscoveryLeadRow[];
  const totalCount = evidence.totalLeadsCount || allLeads.length;
  const filterChips = useMemo<FilterChip[]>(() => evidence.filterChips || [], [evidence.filterChips]);
  const outreachLabel = evidence.outreachLabel || 'Next: Plan outreach for these leads';

  // Quick play: card-specific evidence where pre-applied filters ARE the root context.
  // Only hide "X leads" root when there are actually pre-applied filters (Cards 1 & 3 imply function).
  const isQuickPlay = evidence.id.startsWith('ev_quick_') && (evidence.appliedFilters || []).length > 0;

  // ── Column order & visibility ─────────────────────────────────
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    BASE_COLUMNS.map((c) => c.id)
  );
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const visibleColumns = useMemo(
    () => columnOrder.filter((id) => !hiddenIds.has(id)).map((id) => BASE_COLUMNS.find((c) => c.id === id)!).filter(Boolean),
    [columnOrder, hiddenIds]
  );

  const hiddenColumns = useMemo(
    () => BASE_COLUMNS.filter((c) => hiddenIds.has(c.id)),
    [hiddenIds]
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

  // ── Filter breadcrumb stack ─────────────────────────────────────
  const [filterStack, setFilterStack] = useState<string[]>(
    () => (evidence.appliedFilters || [])
  );

  // Sync filterStack when evidence changes (e.g., engine applies filters via chat)
  // Watch both evidence.id AND appliedFilters so stacked filters on the same evidence ID work
  const appliedFiltersKey = (evidence.appliedFilters || []).join(',');
  useEffect(() => {
    setFilterStack(evidence.appliedFilters || []);
  }, [evidence.id, appliedFiltersKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Progressive filtering — each filter narrows the previous result set
  const { filteredLeads, breadcrumbs, availableFilters } = useMemo(() => {
    let current = allLeads;
    const crumbs: { id: string; label: string; count: number }[] = [];

    for (const filterId of filterStack) {
      current = current.filter(
        (l) => l.filterTags.includes(filterId)
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
          (l) => l.filterTags.includes(c.id)
        ).length,
      }))
      .filter((c) => c.projectedCount > 0);

    return { filteredLeads: current, breadcrumbs: crumbs, availableFilters: available };
  }, [allLeads, filterStack, filterChips]);

  const addFilter = (id: string) => {
    const newStack = [...filterStack, id];
    setFilterStack(newStack);
    updateEvidence(evidence.id, { appliedFilters: newStack });
  };

  const revertTo = (index: number) => {
    const newStack = index < 0 ? [] : filterStack.slice(0, index + 1);
    setFilterStack(newStack);
    updateEvidence(evidence.id, { appliedFilters: newStack });
  };

  // ── Selection ─────────────────────────────────────────────────
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === filteredLeads.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredLeads.map((l) => l.id)));
    }
  };

  // ── Plan outreach CTA ──────────────────────────────────────────
  const handlePlanOutreach = () => {
    if (!selectedJobId) return;
    const msg = `Start outreach campaign for these ${filteredLeads.length} leads`;
    addMessage(selectedJobId, {
      id: `msg_${Date.now()}`,
      role: 'seller',
      timestamp: new Date().toISOString(),
      content: msg,
    });
    setTimeout(() => processSellerMessage(selectedJobId, msg), 100);
  };

  // ── Cell renderer ─────────────────────────────────────────────
  const renderCell = (col: ColumnDef, row: DiscoveryLeadRow) => {
    switch (col.id) {
      case 'name': {
        const profileUrl = row.linkedin || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(row.name)}`;
        return (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate font-body text-ds-small font-semibold text-li-blue hover:underline"
            title={row.name}
          >
            {row.name}
          </a>
        );
      }
      case 'title':
        return (
          <span className="block truncate font-body text-ds-small text-li-text-secondary" title={row.title}>
            {row.title}
          </span>
        );
      case 'company':
        return (
          <span className="block truncate font-body text-ds-small text-li-text-secondary" title={row.company}>
            {row.company}
          </span>
        );
      case 'signal': {
        const signalColor = SIGNAL_COLORS[row.signalType] || 'bg-li-tag-bg text-li-text-tertiary border-li-border-standard';
        return (
          <span
            className={clsx('inline-flex max-w-full truncate rounded-full border px-[8px] py-[2px] font-body text-ds-small font-semibold leading-tight', signalColor)}
            title={row.signal}
          >
            {row.signal}
          </span>
        );
      }
      default:
        return <span className="text-li-text-disabled">—</span>;
    }
  };

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col">
      {!hideHeader && (
        <EvidenceHeader breadcrumb="Agent • Lead Discovery" title={evidence.title} />
      )}

      {/* Breadcrumb filter bar */}
      <div
        className="flex shrink-0 items-center gap-[2px] bg-white px-[24px] py-[10px]"
        style={{ borderBottom: '1px solid var(--border-standard)' }}
      >
        <div className="flex items-center gap-[2px] overflow-hidden">
          {/* Total leads crumb — hidden for quick play (pre-filters are the root) */}
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
              {totalCount} leads
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

          {/* Available next filters */}
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
          onClick={handlePlanOutreach}
          className="ml-auto shrink-0 flex items-center gap-[6px] rounded-[8px] bg-li-blue px-[14px] py-[7px] font-body text-ds-small font-semibold text-white shadow-sm transition-all hover:bg-li-blue-dark hover:shadow-md"
        >
          <Send size={14} />
          {outreachLabel}
        </button>
      </div>

      {/* Leads table */}
      <div className="flex-1 overflow-auto li-scrollbar">
        <table className="min-w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-white">
            <tr style={{ borderBottom: '2px solid var(--border-standard)' }}>
              {/* Checkbox header */}
              <th className="w-[44px] pl-[24px] pr-[4px] py-[8px] text-left align-middle">
                <input
                  type="checkbox"
                  checked={selectedRows.size === filteredLeads.length && filteredLeads.length > 0}
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
                    'group/col relative px-[12px] py-[8px] text-left font-body text-ds-small font-semibold uppercase tracking-wide text-li-text-tertiary select-none',
                    dragOverCol === col.id && 'bg-li-bg-hover'
                  )}
                  style={{ width: col.width }}
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
            {filteredLeads.map((row) => (
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
