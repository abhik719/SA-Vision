import { useState } from 'react';
import type { Evidence, AccountRow } from '../../types/evidence';
import EvidenceHeader from './EvidenceHeader';
import SignalPill from '../ui/SignalPill';
import Button from '../ui/Button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  evidence: Evidence;
  hideHeader?: boolean;
}

export default function AccountsRankedTable({ evidence, hideHeader }: Props) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const rows = (evidence.rows || []) as AccountRow[];
  const columns = evidence.columns || [];

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

  return (
    <div className="flex h-full flex-col">
      {!hideHeader && (
        <EvidenceHeader
          breadcrumb={evidence.context?.threadId ? `Thread • Evidence` : 'Evidence'}
          title={evidence.title}
        />
      )}

      {/* Results toolbar inside a card-like container */}
      <div
        className="flex shrink-0 items-center gap-[8px] bg-white px-[24px] py-[10px]"
        style={{ borderBottom: '1px solid var(--border-standard)' }}
      >
        <input
          type="checkbox"
          checked={selectedRows.size === rows.length && rows.length > 0}
          onChange={toggleAll}
          className="accent-li-blue"
        />
        <span className="font-body text-[13px] text-li-text-secondary">
          {selectedRows.size > 0
            ? `${selectedRows.size} selected`
            : `${rows.length} results`}
        </span>
        {selectedRows.size > 0 && (
          <>
            <Button size="sm">Find leads</Button>
            <Button size="sm" variant="secondary">
              Draft outreach
            </Button>
          </>
        )}
      </div>

      {/* Table container with proper padding so it doesn't smash into pane edges */}
      <div className="flex-1 overflow-auto li-scrollbar px-[12px]">
        <table className="w-full">
          <thead className="sticky top-0 bg-white">
            <tr style={{ borderBottom: '2px solid var(--border-standard)' }}>
              <th className="w-[36px] px-[12px] py-[8px]" />
              <th className="w-[28px]" />
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-[12px] py-[8px] text-left font-body text-ds-small font-semibold text-li-text-tertiary"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isExpanded = expandedRows.has(row.id);
              return (
                <>
                  <tr
                    key={row.id}
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
                    <td className="px-[12px] py-[10px]">
                      <span
                        className={clsx(
                          'inline-flex items-center rounded-ds-spotlight px-[8px] py-[2px] font-body text-ds-small font-semibold',
                          row.score >= 85
                            ? 'bg-[#E8F5E9] text-[#2F7B15]'
                            : row.score >= 70
                              ? 'bg-[#FFF3E0] text-[#C37D16]'
                              : 'bg-li-tag-bg text-li-text-tertiary'
                        )}
                      >
                        {row.score}
                      </span>
                    </td>
                    <td className="px-[12px] py-[10px] font-body text-ds-base text-li-text-secondary">
                      {row.intent}
                    </td>
                    <td className="px-[12px] py-[10px]">
                      <span
                        className={clsx(
                          'font-body text-ds-base font-semibold',
                          row.change.startsWith('+')
                            ? 'text-[#2F7B15]'
                            : row.change.startsWith('-')
                              ? 'text-[#CC1016]'
                              : 'text-li-text-tertiary'
                        )}
                      >
                        {row.change}
                      </span>
                    </td>
                    <td className="px-[12px] py-[10px]">
                      <div className="flex flex-wrap gap-[4px]">
                        {row.why.slice(0, 2).map((s, i) => (
                          <SignalPill key={i} signal={s} />
                        ))}
                        {row.why.length > 2 && (
                          <span className="font-body text-ds-small text-li-text-disabled">
                            +{row.why.length - 2}
                          </span>
                        )}
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
                            Why ranked #{rows.indexOf(row) + 1}
                          </span>
                          <ul className="mt-[4px] flex flex-col gap-[2px]">
                            {row.why.map((s, i) => (
                              <li
                                key={i}
                                className="font-body text-ds-small text-li-text-secondary"
                              >
                                &bull; {s}
                              </li>
                            ))}
                          </ul>
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
