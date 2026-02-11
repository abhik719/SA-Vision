import type { Evidence } from '../../types/evidence';
import { useAppStore } from '../../store/useAppStore';
import { useJobStore } from '../../store/useJobStore';
import EvidenceHeader from './EvidenceHeader';
import Button from '../ui/Button';
import { BarChart3, AlertCircle, Lightbulb, Send, RefreshCw, Calendar } from 'lucide-react';

interface Props {
  evidence: Evidence;
  hideHeader?: boolean;
}

export default function JobResults({ evidence, hideHeader }: Props) {
  const selectedJobId = useAppStore((s) => s.selectedJobId);
  const job = useJobStore((s) =>
    selectedJobId ? s.jobsById[selectedJobId] : null
  );

  const summary = job?.outputs?.summary || evidence.summary || {};

  return (
    <div className="flex h-full flex-col">
      {!hideHeader && (
        <EvidenceHeader breadcrumb="Job • Results" title={evidence.title} />
      )}

      <div className="flex-1 overflow-y-auto li-scrollbar" style={{ padding: 'var(--evidence-padding-top) var(--evidence-padding-x) var(--evidence-padding-bottom)' }}>
        <div className="flex flex-col gap-[20px]" style={{ maxWidth: 'var(--evidence-max-width)' }}>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-[12px]">
            {Object.entries(summary).map(([key, value]) => {
              const label = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (s) => s.toUpperCase())
                .trim();
              const Icon =
                key.includes('Found') || key.includes('Created')
                  ? BarChart3
                  : key.includes('Gap')
                    ? AlertCircle
                    : Lightbulb;
              return (
                <div key={key} className="li-card flex items-center gap-[12px] p-[16px]">
                  <div className="flex h-[36px] w-[36px] items-center justify-center rounded-ds-card bg-li-bg-tertiary">
                    <Icon size={18} className="text-li-blue" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display text-ds-heading font-semibold text-li-text-primary">
                      {String(value)}
                    </span>
                    <span className="font-body text-ds-small text-li-text-tertiary">
                      {label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next best actions */}
          <div className="li-card p-[20px]">
            <h4 className="mb-[12px] font-body text-ds-base font-semibold text-li-text-primary">
              Next best actions
            </h4>
            <div className="flex flex-col gap-[8px]">
              <Button size="sm">
                <Send size={12} className="mr-[4px]" /> Draft outreach for
                selected leads
              </Button>
              <Button size="sm" variant="secondary">
                <RefreshCw size={12} className="mr-[4px]" /> Refine and rerun
              </Button>
              <Button size="sm" variant="secondary">
                <Calendar size={12} className="mr-[4px]" /> Start weekly scan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
