import { useState, Fragment } from 'react';
import type { Evidence, LeadRow } from '../../types/evidence';
import EvidenceHeader from './EvidenceHeader';
import SignalPill from '../ui/SignalPill';
import Button from '../ui/Button';
import { ChevronDown, ChevronRight, Send } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { processSellerMessage } from '../../flows/engine';
import clsx from 'clsx';

interface Props {
  evidence: Evidence;
  hideHeader?: boolean;
}

export default function LeadsTable({ evidence, hideHeader }: Props) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const rows = (evidence.rows || []) as LeadRow[];
  const selectThread = useAppStore((s) => s.selectThread);
  const setCurrentEvidence = useAppStore((s) => s.setCurrentEvidence);

  const handleStartOutreachPlan = () => {
    // Check if outreach thread already exists
    const existingThread = 'thread_outreach_01';
    selectThread(existingThread);
    setCurrentEvidence('ev_outreach_plan_01');
    // Send a message to trigger the flow
    processSellerMessage(existingThread, 'Start outreach plan for these leads');
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
    if (selectedRows.size === rows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(rows.map((r) => r.id)));
    }
  };

  const hasSelection = selectedRows.size > 0;

  return (
    <div className="flex h-full flex-col">
      {!hideHeader && (
        <EvidenceHeader
          breadcrumb={evidence.context?.jobId ? `Job • Results` : 'Evidence'}
          title={evidence.title}
        />
      )}

      {/* Table container */}
      <div className="flex-1 overflow-auto li-scrollbar">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-white">
            {/* Summary row — integrated into table header */}
            <tr style={{ borderBottom: '1px solid var(--border-standard)' }}>
              <th className="w-[36px] px-[12px] py-[8px] text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === rows.length && rows.length > 0}
                  onChange={toggleAll}
                  className="accent-li-blue"
                />
              </th>
              <th className="w-[28px]" />
              <th colSpan={5} className="px-[12px] py-[8px] text-left">
                <div className="flex items-center gap-[8px]">
                  <span className="font-body text-[13px] text-li-text-secondary">
                    {hasSelection
                      ? `${selectedRows.size} selected`
                      : `${rows.length} lead${rows.length !== 1 ? 's' : ''}`}
                  </span>
                  {hasSelection ? (
                    <>
                      <Button size="sm">Draft outreach for selected</Button>
                      <Button size="sm" variant="secondary">Use as input</Button>
                    </>
                  ) : (
                    <button
                      onClick={handleStartOutreachPlan}
                      className="flex items-center gap-[4px] rounded-[6px] bg-li-blue px-[10px] py-[4px] font-body text-[12px] font-medium text-white transition-colors hover:bg-li-blue-dark"
                    >
                      <Send size={12} />
                      Start outreach plan
                    </button>
                  )}
                </div>
              </th>
            </tr>
            {/* Column headers */}
            <tr style={{ borderBottom: '2px solid var(--border-standard)' }}>
              <th className="w-[36px] px-[12px] py-[8px]" />
              <th className="w-[28px]" />
              <th className="px-[12px] py-[8px] text-left font-body text-ds-small font-semibold text-li-text-tertiary">
                Lead
              </th>
              <th className="px-[12px] py-[8px] text-left font-body text-ds-small font-semibold text-li-text-tertiary">
                Title
              </th>
              <th className="px-[12px] py-[8px] text-left font-body text-ds-small font-semibold text-li-text-tertiary">
                Company
              </th>
              <th className="px-[12px] py-[8px] text-left font-body text-ds-small font-semibold text-li-text-tertiary">
                Match
              </th>
              <th className="px-[12px] py-[8px] text-left font-body text-ds-small font-semibold text-li-text-tertiary">
                Signals
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isExpanded = expandedRows.has(row.id);
              return (
                <Fragment key={row.id}>
                  <tr
                    className={clsx(
                      'cursor-pointer transition-colors hover:bg-li-bg-hover',
                      selectedRows.has(row.id) && 'bg-li-bg-selected'
                    )}
                    style={{
                      borderBottom: '1px solid var(--border-standard)',
                    }}
                  >
                    <td className="px-[12px] py-[10px]">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id)}
                        onChange={() => toggleSelect(row.id)}
                        className="accent-li-blue"
                      />
                    </td>
                    <td className="py-[10px]">
                      <button onClick={() => toggleExpand(row.id)}>
                        {isExpanded ? (
                          <ChevronDown size={14} style={{ color: 'rgba(0,0,0,0.5)' }} />
                        ) : (
                          <ChevronRight size={14} style={{ color: 'rgba(0,0,0,0.5)' }} />
                        )}
                      </button>
                    </td>
                    <td className="px-[12px] py-[10px] font-body text-ds-base font-semibold text-li-text-primary">
                      {row.name}
                    </td>
                    <td className="px-[12px] py-[10px] font-body text-ds-base text-li-text-secondary">
                      {row.title}
                    </td>
                    <td className="px-[12px] py-[10px] font-body text-ds-base text-li-text-secondary">
                      {row.company}
                    </td>
                    <td className="px-[12px] py-[10px]">
                      <span
                        className={clsx(
                          'inline-flex items-center rounded-ds-spotlight px-[8px] py-[2px] font-body text-ds-small font-semibold',
                          row.matchScore >= 85
                            ? 'bg-[#E8F5E9] text-[#2F7B15]'
                            : row.matchScore >= 70
                              ? 'bg-[#FFF3E0] text-[#C37D16]'
                              : 'bg-li-tag-bg text-li-text-tertiary'
                        )}
                      >
                        {row.matchScore}
                      </span>
                    </td>
                    <td className="px-[12px] py-[10px]">
                      <div className="flex flex-wrap gap-[4px]">
                        {row.signals.slice(0, 2).map((s, i) => (
                          <SignalPill key={i} signal={s} />
                        ))}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr
                      key={`${row.id}-exp`}
                      style={{
                        borderBottom: '1px solid var(--border-standard)',
                      }}
                    >
                      <td />
                      <td />
                      <td colSpan={5} className="px-[12px] py-[12px]">
                        <div className="rounded-ds-card bg-li-bg-tertiary p-[12px]">
                          <span className="font-body text-ds-small font-semibold text-li-text-tertiary">
                            Why recommended
                          </span>
                          <ul className="mt-[4px] flex flex-col gap-[2px]">
                            {row.signals.map((s, i) => (
                              <li
                                key={i}
                                className="font-body text-ds-small text-li-text-secondary"
                              >
                                &bull; {s}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-[8px]">
                            <Button size="sm" variant="secondary">
                              Use as input
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
