import { useMemo, useState } from 'react';
import { useJobStore } from '../../store/useJobStore';
import { useAppStore } from '../../store/useAppStore';

import SearchBox from '../ui/SearchBox';
import JobListItem from './JobListItem';
import type { Job } from '../../types/job';
import { ChevronRight } from 'lucide-react';

export default function JobList() {
  const [search, setSearch] = useState('');
  const jobsById = useJobStore((s) => s.jobsById);
  const selectedJobId = useAppStore((s) => s.selectedJobId);
  const selectJob = useAppStore((s) => s.selectJob);
  const setCurrentEvidence = useAppStore((s) => s.setCurrentEvidence);

  // Collapse states — 1 & 2 expanded, 3/4/5 collapsed
  const [needsInputOpen, setNeedsInputOpen] = useState(true);
  const [readyOpen, setReadyOpen] = useState(true);
  const [queuedOpen, setQueuedOpen] = useState(false);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [archivedOpen, setArchivedOpen] = useState(false);

  const jobs = useMemo(
    () =>
      Object.values(jobsById).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [jobsById]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return jobs;
    const q = search.toLowerCase();
    return jobs.filter((j) => j.title.toLowerCase().includes(q));
  }, [jobs, search]);

  // Bucket jobs into the 5 sections
  const nonArchived = filtered.filter((j) => !j.archived);
  const archived = filtered.filter((j) => j.archived);

  // 1. Needs input — approval needed or failed/blocked
  const needsInput = nonArchived.filter(
    (j) => j.status === 'NEEDS_APPROVAL' || j.status === 'FAILED'
  );

  // 2. Ready to review — completed but not yet viewed
  const readyToReview = nonArchived.filter(
    (j) => j.status === 'COMPLETED' && !j.viewedAt
  );

  // 4. Recurring — has a schedule
  const recurring = nonArchived.filter((j) => !!j.schedule);

  // 3. Queued — running, queued, or completed+viewed (non-recurring)
  const queued = nonArchived.filter(
    (j) =>
      !j.schedule &&
      (j.status === 'QUEUED' ||
        j.status === 'RUNNING' ||
        (j.status === 'COMPLETED' && !!j.viewedAt))
  );

  const handleSelect = (job: Job) => {
    selectJob(job.id);
    if (job.evidenceId) {
      setCurrentEvidence(job.evidenceId);
    }
  };

  const hasTopContent =
    needsInput.length > 0 || readyToReview.length > 0;
  const hasBottomContent =
    queued.length > 0 || recurring.length > 0 || archived.length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-[16px] py-[12px]">
        <SearchBox value={search} onChange={setSearch} placeholder="Search jobs..." />
      </div>

      {/* Main scrollable area: sections 1 & 2 */}
      <div className="flex-1 overflow-y-auto li-scrollbar">
        {/* 1. Needs input */}
        {needsInput.length > 0 && (
          <JobSection
            label="Needs input"
            count={needsInput.length}
            open={needsInputOpen}
            onToggle={() => setNeedsInputOpen(!needsInputOpen)}
            highlight
          >
            {needsInput.map((j) => (
              <JobListItem key={j.id} job={j} selected={selectedJobId === j.id} onClick={() => handleSelect(j)} />
            ))}
          </JobSection>
        )}

        {/* 2. Ready to review */}
        {readyToReview.length > 0 && (
          <JobSection
            label="Ready to review"
            count={readyToReview.length}
            open={readyOpen}
            onToggle={() => setReadyOpen(!readyOpen)}
          >
            {readyToReview.map((j) => (
              <JobListItem key={j.id} job={j} selected={selectedJobId === j.id} onClick={() => handleSelect(j)} />
            ))}
          </JobSection>
        )}

        {!hasTopContent && filtered.length === 0 && (
          <div className="px-[16px] py-[24px] text-center font-body text-ds-base text-li-text-tertiary">
            No jobs found.
          </div>
        )}

        {!hasTopContent && filtered.length > 0 && (
          <div className="px-[16px] py-[16px] text-center font-body text-[12px] text-li-text-tertiary">
            Nothing waiting on you right now.
          </div>
        )}
      </div>

      {/* Bottom-pinned: sections 3, 4, 5 — collapsed by default */}
      {hasBottomContent && (
        <div className="shrink-0" style={{ borderTop: '1px solid var(--border-standard)' }}>
          {/* 3. Queued (includes running + completed/viewed) */}
          {queued.length > 0 && (
            <JobSection
              label="Queued"
              count={queued.length}
              open={queuedOpen}
              onToggle={() => setQueuedOpen(!queuedOpen)}
              maxHeight={240}
            >
              {queued.map((j) => (
                <JobListItem key={j.id} job={j} selected={selectedJobId === j.id} onClick={() => handleSelect(j)} />
              ))}
            </JobSection>
          )}

          {/* 4. Recurring */}
          {recurring.length > 0 && (
            <JobSection
              label="Recurring"
              count={recurring.length}
              open={recurringOpen}
              onToggle={() => setRecurringOpen(!recurringOpen)}
              maxHeight={200}
            >
              {recurring.map((j) => (
                <JobListItem key={j.id} job={j} selected={selectedJobId === j.id} onClick={() => handleSelect(j)} />
              ))}
            </JobSection>
          )}

          {/* 5. Archived */}
          {archived.length > 0 && (
            <JobSection
              label="Archived"
              count={archived.length}
              open={archivedOpen}
              onToggle={() => setArchivedOpen(!archivedOpen)}
              maxHeight={200}
            >
              {archived.map((j) => (
                <JobListItem key={j.id} job={j} selected={selectedJobId === j.id} onClick={() => handleSelect(j)} />
              ))}
            </JobSection>
          )}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────── JobSection ────────────────────────── */

interface JobSectionProps {
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  highlight?: boolean;
  maxHeight?: number;
  children: React.ReactNode;
}

function JobSection({ label, count, open, onToggle, highlight, maxHeight, children }: JobSectionProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-[4px] px-[16px] py-[6px] text-left"
      >
        <ChevronRight
          size={11}
          className={`text-li-text-tertiary transition-transform ${open ? 'rotate-90' : ''}`}
        />
        <span className="font-body text-[11px] font-semibold uppercase tracking-wider text-li-text-tertiary">
          {label}
        </span>
        <span
          className={`rounded-[3px] px-[5px] py-[0px] font-body text-[10px] font-medium ${
            highlight
              ? 'bg-li-blue text-white'
              : 'bg-li-bg-tertiary text-li-text-secondary'
          }`}
        >
          {count}
        </span>
      </button>
      {open && (
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
