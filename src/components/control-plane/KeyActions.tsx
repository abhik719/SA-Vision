import { useState } from 'react';
import type { Thread } from '../../types/thread';
import { useAppStore } from '../../store/useAppStore';
import { useJobStore } from '../../store/useJobStore';
import StatusPill from '../ui/StatusPill';
import { ChevronRight, Briefcase } from 'lucide-react';

interface Props {
  thread: Thread;
}

export default function KeyActions({ thread }: Props) {
  const [expanded, setExpanded] = useState(false);

  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const selectJob = useAppStore((s) => s.selectJob);
  const setCurrentEvidence = useAppStore((s) => s.setCurrentEvidence);
  const jobsById = useJobStore((s) => s.jobsById);

  const actions = thread.keyActions || [];

  // Resolve spawned jobs for this thread
  const spawnedJobs = (thread.spawnedJobIds || [])
    .map((id) => jobsById[id])
    .filter(Boolean);

  if (actions.length === 0 && spawnedJobs.length === 0) return null;

  // Summary counts by type
  const snUpdates = actions.filter((a) => a.type === 'preference' || a.type === 'evidence_view').length;
  const jobEvents = actions.filter((a) => a.type.startsWith('job_')).length;
  const parts: string[] = [];
  const totalJobs = jobEvents + spawnedJobs.length;
  if (snUpdates > 0) parts.push(`${snUpdates} update${snUpdates !== 1 ? 's' : ''}`);
  if (totalJobs > 0) parts.push(`${totalJobs} job${totalJobs !== 1 ? 's' : ''}`);
  const summary = parts.join(' \u2022 ') || 'No activity yet';

  const handleLink = (action: typeof actions[0]) => {
    if (action.jobId) {
      setActiveTab('JOBS');
      selectJob(action.jobId);
      if (action.evidenceId) setCurrentEvidence(action.evidenceId);
    } else if (action.evidenceId) {
      setCurrentEvidence(action.evidenceId);
    }
  };

  const handleOpenJob = (jobId: string) => {
    setActiveTab('JOBS');
    selectJob(jobId);
  };

  // Dot color by type
  const dotColor = (type: string) => {
    if (type === 'job_needs_review' || type === 'job_blocked') return 'bg-li-blue';
    return 'bg-li-border-emphasis';
  };

  return (
    <div
      className="shrink-0"
      style={{ borderBottom: '1px solid var(--border-standard)' }}
    >
      {/* Toggle — aligned with title text (pl-[40px] to match chips row) */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-[6px] py-[6px] pl-[40px] pr-[16px] text-left transition-colors hover:bg-li-bg-hover"
      >
        <ChevronRight
          size={11}
          className={`text-li-text-tertiary transition-transform ${expanded ? 'rotate-90' : ''}`}
        />
        <span className="font-body text-[11px] font-semibold text-li-text-secondary">
          Key actions
        </span>
        {!expanded && (
          <span className="font-body text-[11px] text-li-text-tertiary">
            {summary}
          </span>
        )}
      </button>

      {/* Expanded timeline + spawned jobs */}
      {expanded && (
        <div className="flex flex-col gap-[2px] pb-[8px] pl-[40px] pr-[16px]">
          {/* Spawned jobs section */}
          {spawnedJobs.length > 0 && (
            <div className="mb-[6px] flex flex-col gap-[4px]">
              <span className="font-body text-[10px] font-semibold uppercase tracking-wider text-li-text-tertiary">
                Spawned jobs
              </span>
              {spawnedJobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => handleOpenJob(job.id)}
                  className="flex items-center gap-[8px] rounded-[4px] px-[4px] py-[3px] text-left transition-colors hover:bg-li-bg-hover"
                >
                  <Briefcase size={11} className="shrink-0 text-li-text-tertiary" />
                  <span className="min-w-0 flex-1 truncate font-body text-[11px] font-medium text-li-text-primary">
                    {job.title}
                  </span>
                  <StatusPill status={job.status} />
                  <span className="shrink-0 font-body text-[10px] font-medium text-li-blue">
                    Open
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Activity timeline */}
          {actions.slice(0, 8).map((action) => (
            <div
              key={action.id}
              className="flex items-start gap-[8px] py-[3px]"
            >
              {/* Timeline dot */}
              <div className={`mt-[5px] h-[5px] w-[5px] shrink-0 rounded-full ${dotColor(action.type)}`} />

              {/* Event text */}
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="font-body text-[11px] font-medium text-li-text-primary">
                  {action.title}
                </span>
                <span className="truncate font-body text-[10px] text-li-text-tertiary">
                  {action.subtitle}
                </span>
              </div>

              {/* Deep link */}
              {action.linkLabel && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleLink(action); }}
                  className="shrink-0 font-body text-[10px] font-medium text-li-blue hover:underline"
                >
                  {action.linkLabel}
                </button>
              )}
            </div>
          ))}

          {actions.length > 8 && (
            <span className="mt-[2px] font-body text-[10px] text-li-text-tertiary">
              +{actions.length - 8} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
