import type { Evidence } from '../../types/evidence';
import { useAppStore } from '../../store/useAppStore';
import { useJobStore } from '../../store/useJobStore';
import EvidenceHeader from './EvidenceHeader';
import Button from '../ui/Button';
import { Loader2, CheckCircle, Circle } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  evidence: Evidence;
  hideHeader?: boolean;
}

export default function JobRunning({ evidence, hideHeader }: Props) {
  const selectedJobId = useAppStore((s) => s.selectedJobId);
  const setJobStatus = useJobStore((s) => s.setJobStatus);

  const stages = evidence.stages || [];
  const currentStage = evidence.currentStage ?? 0;
  const log = evidence.log || [];

  return (
    <div className="flex h-full flex-col">
      {!hideHeader && (
        <EvidenceHeader breadcrumb="Job • Running" title={evidence.title} />
      )}

      <div className="flex-1 overflow-y-auto li-scrollbar" style={{ padding: 'var(--evidence-padding-top) var(--evidence-padding-x) var(--evidence-padding-bottom)' }}>
        <div className="flex flex-col gap-[24px]" style={{ maxWidth: 'var(--evidence-max-width)' }}>
          {/* Progress timeline */}
          <div className="li-card p-[20px]">
            <h4 className="mb-[12px] font-body text-ds-base font-semibold text-li-text-primary">
              Progress
            </h4>
            <div className="flex flex-col gap-[8px]">
              {stages.map((stage, i) => {
                const isDone = i < currentStage;
                const isCurrent = i === currentStage;
                return (
                  <div key={i} className="flex items-center gap-[10px]">
                    {isDone ? (
                      <CheckCircle size={18} className="shrink-0 text-[#2F7B15]" />
                    ) : isCurrent ? (
                      <Loader2
                        size={18}
                        className="shrink-0 animate-spin text-li-blue"
                      />
                    ) : (
                      <Circle
                        size={18}
                        className="shrink-0"
                        style={{ color: 'rgba(0,0,0,0.2)' }}
                      />
                    )}
                    <span
                      className={clsx(
                        'font-body text-ds-base',
                        isDone
                          ? 'text-li-text-tertiary line-through'
                          : isCurrent
                            ? 'font-semibold text-li-text-primary'
                            : 'text-li-text-disabled'
                      )}
                    >
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity log */}
          <div className="li-card p-[20px]">
            <h4 className="mb-[12px] font-body text-ds-base font-semibold text-li-text-primary">
              What I'm doing
            </h4>
            <div className="flex flex-col gap-[4px]">
              {log.map((entry, i) => (
                <div key={i} className="flex items-start gap-[8px]">
                  <span className="shrink-0 font-mono text-ds-small text-li-text-disabled">
                    {entry.time}
                  </span>
                  <span className="font-body text-ds-small text-li-text-secondary">
                    {entry.message}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton preview */}
          <div className="li-card p-[20px]">
            <h4 className="mb-[12px] font-body text-ds-base font-semibold text-li-text-primary">
              Preview
            </h4>
            <div className="flex flex-col gap-[8px]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-[12px]">
                  <div className="h-[12px] w-[120px] animate-pulse rounded bg-li-tag-bg" />
                  <div className="h-[12px] w-[80px] animate-pulse rounded bg-li-tag-bg" />
                  <div className="h-[12px] w-[160px] animate-pulse rounded bg-li-tag-bg" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => selectedJobId && setJobStatus(selectedJobId, 'CANCELLED')}
            >
              Cancel job
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
