import { useState } from 'react';
import type { Evidence, PrioritizedAccountRow, FilterChip } from '../../types/evidence';
import { useAppStore } from '../../store/useAppStore';
import { useJobStore } from '../../store/useJobStore';
import { processSellerMessage } from '../../flows/engine';
import EvidenceHeader from './EvidenceHeader';
import { ChevronDown, ChevronRight, Users } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  evidence: Evidence;
  hideHeader?: boolean;
}

const SIGNAL_COLORS: Record<string, string> = {
  leadership: 'bg-[#EDE7F6] text-[#7C3AED] border-[#D1C4E9]',
  funding: 'bg-[#E3F2FD] text-[#1565C0] border-[#BBDEFB]',
  engagement: 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]',
  tech_fit: 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]',
  expansion: 'bg-[#F3E5F5] text-[#6A1B9A] border-[#E1BEE7]',
};

export default function AccountsPrioritized({ evidence, hideHeader }: Props) {
  const selectedJobId = useAppStore((s) => s.selectedJobId);
  const addMessage = useJobStore((s) => s.addMessage);

  const allAccounts = (evidence.accountsPrioritized || []) as PrioritizedAccountRow[];
  const filterChips = (evidence.filterChips || []) as FilterChip[];
  const findLeadsLabel = evidence.findLeadsLabel || 'Next: Find leads in these accounts';

  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Filter accounts
  const filteredAccounts = activeFilters.size === 0
    ? allAccounts
    : allAccounts.filter((a) =>
        Array.from(activeFilters).some((f) => a.filterTags.includes(f))
      );

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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

  return (
    <div className="flex h-full flex-col">
      {!hideHeader && (
        <EvidenceHeader breadcrumb="Agent • Account Prioritization" title={evidence.title} />
      )}

      {/* Filter chips + summary bar */}
      <div
        className="flex shrink-0 flex-col gap-[12px] bg-white px-[24px] py-[14px]"
        style={{ borderBottom: '1px solid var(--border-standard)' }}
      >
        {/* Summary + CTA row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <input
              type="checkbox"
              checked={selectedRows.size === filteredAccounts.length && filteredAccounts.length > 0}
              onChange={toggleAll}
              className="accent-li-blue"
            />
            <span className="font-body text-[13px] text-li-text-secondary">
              {activeFilters.size > 0
                ? `${filteredAccounts.length} of ${allAccounts.length} accounts match`
                : `${allAccounts.length} prioritized accounts`}
            </span>
            {selectedRows.size > 0 && (
              <span className="font-body text-[13px] font-semibold text-li-text-primary">
                ({selectedRows.size} selected)
              </span>
            )}
          </div>
          <button
            onClick={handleFindLeads}
            className="flex items-center gap-[6px] rounded-[8px] bg-li-blue px-[14px] py-[7px] font-body text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-li-blue-dark hover:shadow-md"
          >
            <Users size={14} />
            {findLeadsLabel}
          </button>
        </div>

        {/* Filter chips */}
        {filterChips.length > 0 && (
          <div className="flex items-center gap-[6px]">
            <span className="font-body text-[11px] text-li-text-disabled">Filter:</span>
            {filterChips.map((chip) => {
              const isActive = activeFilters.has(chip.id);
              return (
                <button
                  key={chip.id}
                  onClick={() => toggleFilter(chip.id)}
                  className={clsx(
                    'rounded-full border px-[10px] py-[3px] font-body text-[11px] font-medium transition-all',
                    isActive
                      ? 'border-li-blue bg-li-blue/10 text-li-blue'
                      : 'border-li-border-standard bg-white text-li-text-tertiary hover:bg-li-bg-hover hover:text-li-text-secondary'
                  )}
                >
                  {chip.label} ({chip.count})
                </button>
              );
            })}
            {activeFilters.size > 0 && (
              <button
                onClick={() => setActiveFilters(new Set())}
                className="font-body text-[11px] text-li-text-disabled hover:text-li-text-secondary"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Accounts table */}
      <div className="flex-1 overflow-auto li-scrollbar">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-white">
            <tr style={{ borderBottom: '2px solid var(--border-standard)' }}>
              <th className="w-[36px] px-[8px] py-[8px]" />
              <th className="w-[28px] py-[8px]" />
              <th className="px-[12px] py-[8px] text-left font-body text-[11px] font-semibold uppercase tracking-wide text-li-text-tertiary">
                Account
              </th>
              <th className="w-[60px] px-[8px] py-[8px] text-center font-body text-[11px] font-semibold uppercase tracking-wide text-li-text-tertiary">
                Score
              </th>
              <th className="w-[220px] px-[12px] py-[8px] text-left font-body text-[11px] font-semibold uppercase tracking-wide text-li-text-tertiary">
                Primary Signal
              </th>
              <th className="w-[140px] px-[12px] py-[8px] text-left font-body text-[11px] font-semibold uppercase tracking-wide text-li-text-tertiary">
                Industry
              </th>
              <th className="w-[80px] px-[8px] py-[8px] text-center font-body text-[11px] font-semibold uppercase tracking-wide text-li-text-tertiary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((row, idx) => {
              const isExpanded = expandedRows.has(row.id);
              const signalColor = SIGNAL_COLORS[row.signalType] || 'bg-li-tag-bg text-li-text-tertiary border-li-border-standard';
              return (
                <>
                  {/* Main row */}
                  <tr
                    key={row.id}
                    className={clsx(
                      'cursor-pointer transition-colors hover:bg-li-bg-hover',
                      selectedRows.has(row.id) && 'bg-li-bg-selected'
                    )}
                    style={{ borderBottom: '1px solid var(--border-standard)' }}
                    onClick={() => toggleExpand(row.id)}
                  >
                    <td className="w-[36px] px-[8px] py-[10px]" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id)}
                        onChange={() => toggleSelect(row.id)}
                        className="accent-li-blue"
                      />
                    </td>
                    <td className="w-[28px] py-[10px]">
                      {isExpanded ? (
                        <ChevronDown size={14} className="text-li-text-disabled" />
                      ) : (
                        <ChevronRight size={14} className="text-li-text-disabled" />
                      )}
                    </td>
                    <td className="px-[12px] py-[10px]">
                      <div className="flex items-baseline gap-[8px]">
                        <span className="font-body text-[13px] font-semibold text-li-text-primary">
                          {row.company}
                        </span>
                        <span className="font-body text-[11px] text-li-text-disabled">
                          {row.employees}
                        </span>
                      </div>
                    </td>
                    <td className="w-[60px] px-[8px] py-[10px] text-center">
                      <span
                        className={clsx(
                          'inline-flex items-center justify-center rounded-full px-[8px] py-[2px] font-body text-[12px] font-bold tabular-nums',
                          row.score >= 90
                            ? 'bg-[#E8F5E9] text-[#2F7B15]'
                            : row.score >= 80
                              ? 'bg-[#FFF3E0] text-[#C37D16]'
                              : 'bg-li-tag-bg text-li-text-tertiary'
                        )}
                      >
                        {row.score}
                      </span>
                    </td>
                    <td className="w-[220px] px-[12px] py-[10px]">
                      <span className={clsx('inline-flex rounded-full border px-[8px] py-[2px] font-body text-[11px] font-medium leading-tight', signalColor)}>
                        {row.primarySignal}
                      </span>
                    </td>
                    <td className="w-[140px] px-[12px] py-[10px] font-body text-[12px] text-li-text-secondary">
                      {row.industry}
                    </td>
                    <td className="w-[80px] px-[8px] py-[10px] text-center">
                      <span className="font-body text-[11px] text-li-text-tertiary">
                        {row.actionItems.length} items
                      </span>
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {isExpanded && (
                    <tr key={`${row.id}-detail`} style={{ borderBottom: '1px solid var(--border-standard)' }}>
                      <td colSpan={7} className="bg-[#FAFAFA] p-0">
                        <div className="px-[68px] py-[12px]">
                          <div className="rounded-[8px] bg-white p-[16px] shadow-sm" style={{ border: '1px solid var(--border-standard)' }}>
                            <div className="mb-[8px] flex items-center justify-between">
                              <span className="font-body text-[11px] font-semibold uppercase tracking-wide text-li-text-tertiary">
                                Why ranked #{idx + 1}
                              </span>
                              <span className="font-body text-[11px] text-li-text-disabled">
                                {row.location}
                              </span>
                            </div>
                            <ul className="flex flex-col gap-[4px]">
                              {row.actionItems.map((item, i) => (
                                <li key={i} className="flex items-start gap-[6px] font-body text-[12px] text-li-text-secondary">
                                  <span className="mt-[1px] text-li-text-disabled">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
