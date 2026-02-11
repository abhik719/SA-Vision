import { useState } from 'react';
import type { Evidence, DiscoveryLeadRow } from '../../types/evidence';
import { useAppStore } from '../../store/useAppStore';
import EvidenceHeader from './EvidenceHeader';
import Button from '../ui/Button';
import { Download, Save, Rocket, Search, Mail, Linkedin, ExternalLink, ArrowUpDown } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  evidence: Evidence;
  hideHeader?: boolean;
}

const SIGNAL_COLORS: Record<string, string> = {
  job_change: 'bg-[#EDE7F6] text-[#7C3AED]',
  engagement: 'bg-[#E8F5E9] text-[#2E7D32]',
  intent: 'bg-[#E3F2FD] text-[#1565C0]',
  tech_stack: 'bg-[#FFF3E0] text-[#E65100]',
};

const SIGNAL_FILTERS = [
  { id: 'job_change', label: 'Job changes' },
  { id: 'engagement', label: 'High engagement' },
  { id: 'intent', label: 'Intent signals' },
  { id: 'tech_stack', label: 'Tech alignment' },
];

type SortKey = 'score' | 'name' | 'company';

export default function LeadsFinalList({ evidence, hideHeader }: Props) {
  const setCurrentEvidence = useAppStore((s) => s.setCurrentEvidence);
  const allLeads = (evidence.leadsDiscovery || []) as DiscoveryLeadRow[];

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortAsc, setSortAsc] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter
  let filtered = activeFilter
    ? allLeads.filter((l) => l.signalType === activeFilter)
    : allLeads;

  // Search
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.title.toLowerCase().includes(q)
    );
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'score') cmp = a.score - b.score;
    else if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortKey === 'company') cmp = a.company.localeCompare(b.company);
    return sortAsc ? cmp : -cmp;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === sorted.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(sorted.map((l) => l.id)));
    }
  };

  const handleStartOutreach = () => {
    setCurrentEvidence('ev_outreach_plan_01');
  };

  return (
    <div className="flex h-full flex-col">
      {!hideHeader && (
        <EvidenceHeader breadcrumb="Agent • Lead List Complete" title={evidence.title} />
      )}

      {/* Top actions bar */}
      <div
        className="flex shrink-0 items-center justify-between bg-white px-[24px] py-[12px]"
        style={{ borderBottom: '1px solid var(--border-standard)' }}
      >
        <div className="flex items-center gap-[8px]">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-[8px] top-[8px] text-li-text-disabled" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads..."
              className="rounded-[6px] border border-li-border-standard bg-li-bg-tertiary py-[6px] pl-[28px] pr-[12px] font-body text-[12px] text-li-text-primary placeholder:text-li-text-disabled focus:border-li-blue focus:outline-none"
              style={{ width: 200 }}
            />
          </div>

          {/* Signal filters */}
          {SIGNAL_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(activeFilter === f.id ? null : f.id)}
              className={clsx(
                'rounded-full border px-[10px] py-[3px] font-body text-[11px] font-medium transition-all',
                activeFilter === f.id
                  ? 'border-li-blue bg-li-blue/10 text-li-blue'
                  : 'border-li-border-standard bg-white text-li-text-tertiary hover:bg-li-bg-hover'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-[8px]">
          <button className="flex items-center gap-[4px] rounded-[6px] border border-li-border-standard bg-white px-[10px] py-[5px] font-body text-[12px] text-li-text-secondary transition-colors hover:bg-li-bg-hover">
            <Download size={13} />
            Export CSV
          </button>
          <button className="flex items-center gap-[4px] rounded-[6px] border border-li-border-standard bg-white px-[10px] py-[5px] font-body text-[12px] text-li-text-secondary transition-colors hover:bg-li-bg-hover">
            <Save size={13} />
            Save as list
          </button>
          <button
            onClick={handleStartOutreach}
            className="flex items-center gap-[4px] rounded-[6px] bg-li-blue px-[10px] py-[5px] font-body text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-li-blue-dark"
          >
            <Rocket size={13} />
            Start outreach campaign
          </button>
        </div>
      </div>

      {/* Results count */}
      <div
        className="flex items-center gap-[8px] bg-white px-[24px] py-[8px]"
        style={{ borderBottom: '1px solid var(--border-standard)' }}
      >
        <input
          type="checkbox"
          checked={selectedRows.size === sorted.length && sorted.length > 0}
          onChange={toggleAll}
          className="accent-li-blue"
        />
        <span className="font-body text-[13px] text-li-text-secondary">
          {selectedRows.size > 0
            ? `${selectedRows.size} selected`
            : `${sorted.length} lead${sorted.length !== 1 ? 's' : ''}`}
        </span>
        {selectedRows.size > 0 && (
          <>
            <Button size="sm">Draft outreach for selected</Button>
            <Button size="sm" variant="secondary">Add to list</Button>
          </>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto li-scrollbar px-[12px]">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-white">
            <tr style={{ borderBottom: '2px solid var(--border-standard)' }}>
              <th className="w-[36px] px-[12px] py-[8px]" />
              <th className="px-[12px] py-[8px] text-left">
                <button onClick={() => toggleSort('name')} className="flex items-center gap-[4px] font-body text-ds-small font-semibold text-li-text-tertiary hover:text-li-text-primary">
                  Lead <ArrowUpDown size={11} />
                </button>
              </th>
              <th className="px-[12px] py-[8px] text-left font-body text-ds-small font-semibold text-li-text-tertiary">
                Title
              </th>
              <th className="px-[12px] py-[8px] text-left">
                <button onClick={() => toggleSort('company')} className="flex items-center gap-[4px] font-body text-ds-small font-semibold text-li-text-tertiary hover:text-li-text-primary">
                  Company <ArrowUpDown size={11} />
                </button>
              </th>
              <th className="px-[12px] py-[8px] text-left font-body text-ds-small font-semibold text-li-text-tertiary">
                Signals
              </th>
              <th className="px-[12px] py-[8px] text-left font-body text-ds-small font-semibold text-li-text-tertiary">
                Rationale
              </th>
              <th className="px-[12px] py-[8px] text-left">
                <button onClick={() => toggleSort('score')} className="flex items-center gap-[4px] font-body text-ds-small font-semibold text-li-text-tertiary hover:text-li-text-primary">
                  Score <ArrowUpDown size={11} />
                </button>
              </th>
              <th className="w-[80px] px-[12px] py-[8px] text-left font-body text-ds-small font-semibold text-li-text-tertiary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((lead) => (
              <tr
                key={lead.id}
                className={clsx(
                  'group cursor-pointer transition-colors hover:bg-li-bg-hover',
                  selectedRows.has(lead.id) && 'bg-li-bg-selected'
                )}
                style={{ borderBottom: '1px solid var(--border-standard)' }}
              >
                <td className="px-[12px] py-[10px]">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(lead.id)}
                    onChange={() => toggleSelect(lead.id)}
                    className="accent-li-blue"
                  />
                </td>
                <td className="px-[12px] py-[10px] font-body text-ds-base font-semibold text-li-text-primary">
                  {lead.name}
                </td>
                <td className="px-[12px] py-[10px] font-body text-ds-small text-li-text-secondary">
                  {lead.title}
                </td>
                <td className="px-[12px] py-[10px] font-body text-ds-small text-li-text-secondary">
                  {lead.company}
                </td>
                <td className="px-[12px] py-[10px]">
                  <div className="flex flex-wrap gap-[4px]">
                    {(lead.signals || [lead.signal]).slice(0, 2).map((s, i) => (
                      <span
                        key={i}
                        className={clsx(
                          'inline-flex rounded-full px-[6px] py-[1px] font-body text-[10px] font-medium',
                          SIGNAL_COLORS[lead.signalType] || 'bg-li-tag-bg text-li-text-tertiary'
                        )}
                      >
                        {s}
                      </span>
                    ))}
                    {(lead.signals?.length || 0) > 2 && (
                      <span className="font-body text-[10px] text-li-text-disabled">
                        +{(lead.signals?.length || 0) - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="max-w-[200px] px-[12px] py-[10px] font-body text-[11px] text-li-text-disabled">
                  {lead.rationale}
                </td>
                <td className="px-[12px] py-[10px]">
                  <div className="flex items-center gap-[6px]">
                    <div className="h-[6px] w-[40px] overflow-hidden rounded-full bg-li-bg-tertiary">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${lead.score}%`,
                          background: 'linear-gradient(90deg, #7C3AED, #0A66C2)',
                        }}
                      />
                    </div>
                    <span className="font-body text-[11px] font-semibold text-li-text-tertiary">
                      {lead.score}
                    </span>
                  </div>
                </td>
                <td className="px-[12px] py-[10px]">
                  <div className="flex items-center gap-[4px] opacity-0 transition-opacity group-hover:opacity-100">
                    <button className="rounded p-[4px] text-li-text-disabled hover:bg-li-bg-hover hover:text-li-blue" title="Email">
                      <Mail size={13} />
                    </button>
                    <button className="rounded p-[4px] text-li-text-disabled hover:bg-li-bg-hover hover:text-li-blue" title="LinkedIn">
                      <Linkedin size={13} />
                    </button>
                    <button className="rounded p-[4px] text-li-text-disabled hover:bg-li-bg-hover hover:text-li-blue" title="View profile">
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom status bar */}
      <div
        className="flex items-center justify-between bg-white px-[24px] py-[10px]"
        style={{ borderTop: '1px solid var(--border-standard)' }}
      >
        <div className="flex items-center gap-[8px]">
          <div
            className="h-[8px] w-[8px] rounded-full"
            style={{ background: '#2F7B15' }}
          />
          <span className="font-body text-ds-small text-li-text-tertiary">
            Lead list completed · {allLeads.length} leads from {new Set(allLeads.map((l) => l.company)).size} accounts
          </span>
        </div>
      </div>
    </div>
  );
}
