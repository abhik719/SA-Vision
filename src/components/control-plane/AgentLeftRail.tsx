import { useMemo, useState } from 'react';
import { ArrowLeft, Home, Plus, Search, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { TERMS } from '../../constants/terms';
import { useJobStore } from '../../store/useJobStore';
import type { Job } from '../../types/job';
import { AgentSection } from './AgentSection';
import { AgentJobRow } from './AgentJobRow';
import { ChatTranscript } from './ChatTranscript';
import { ContextualSuggestions } from './ContextualSuggestions';
import { Composer } from './Composer';
import { processSellerMessage } from '../../flows/engine';

// ─── Classification helpers ───────────────────────────────────────

interface ClassifiedJobs {
  needsInput: Job[];
  runningQueued: Job[];
  readyToReview: Job[];
  monitoring: Job[];
  recentAnswers: Job[];
  archived: Job[];
}

function classifyJobs(jobs: Job[]): ClassifiedJobs {
  const result: ClassifiedJobs = {
    needsInput: [],
    runningQueued: [],
    readyToReview: [],
    monitoring: [],
    recentAnswers: [],
    archived: [],
  };

  const now = Date.now();

  for (const job of jobs) {
    // Archived first (explicit archived_at or ARCHIVED status)
    if (job.archived_at || job.status === 'ARCHIVED') {
      result.archived.push(job);
      continue;
    }
    // Scheduled / Monitoring:
    // - If the job has an active schedule AND is currently RUNNING → Monitoring (active run in progress)
    // - If the job has an active schedule but is just QUEUED/SCHEDULED → Running/Queued (waiting for next run)
    if (job.schedule?.is_active || job.status === 'SCHEDULED') {
      if (job.status === 'RUNNING') {
        result.monitoring.push(job);
      } else {
        result.runningQueued.push(job);
      }
      continue;
    }
    // Needs input
    if (job.status === 'NEEDS_INPUT') {
      result.needsInput.push(job);
      continue;
    }
    // Running / queued
    if (job.status === 'RUNNING' || job.status === 'QUEUED') {
      result.runningQueued.push(job);
      continue;
    }
    // Ready to review
    if (job.status === 'READY_TO_REVIEW') {
      result.readyToReview.push(job);
      continue;
    }
    // New — could be a workspace conversation or a newly created play
    if (job.status === 'NEW') {
      // Ephemeral new conversations go to recent answers
      if (job.kind === 'ephemeral') {
        const expiry = job.expires_at ? new Date(job.expires_at).getTime() : Infinity;
        if (expiry > now) {
          result.recentAnswers.push(job);
          continue;
        }
      }
      // Tracked conversations → recent answers
      if (job.type === 'CONVERSATION') {
        result.recentAnswers.push(job);
        continue;
      }
      // Other new jobs → needs input (they need the user to start them)
      result.needsInput.push(job);
      continue;
    }
    // Fallback
    result.archived.push(job);
  }

  // Sort each section: most recently updated first
  const byUpdated = (a: Job, b: Job) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();

  result.needsInput.sort(byUpdated);
  result.runningQueued.sort(byUpdated);
  result.readyToReview.sort(byUpdated);
  result.monitoring.sort(byUpdated);
  result.recentAnswers.sort(byUpdated);
  result.archived.sort(byUpdated);

  return result;
}

// ─── Main Component ───────────────────────────────────────────────

export function AgentLeftRail() {
  const selectedJobId = useAppStore((s) => s.selectedJobId);
  const selectJob = useAppStore((s) => s.selectJob);
  const goHome = useAppStore((s) => s.goHome);
  const setCurrentEvidence = useAppStore((s) => s.setCurrentEvidence);
  const openRecurrenceDialog = useAppStore((s) => s.openRecurrenceDialog);

  const jobsById = useJobStore((s) => s.jobsById);
  const addMessage = useJobStore((s) => s.addMessage);
  const archiveJob = useJobStore((s) => s.archiveJob);
  const unarchiveJob = useJobStore((s) => s.unarchiveJob);
  const deleteJob = useJobStore((s) => s.deleteJob);
  const renameJob = useJobStore((s) => s.renameJob);
  const createJob = useJobStore((s) => s.createJob);

  const [searchQuery, setSearchQuery] = useState('');

  const selectedJob = selectedJobId ? jobsById[selectedJobId] : null;

  // Classify all jobs
  const allJobs = useMemo(() => Object.values(jobsById), [jobsById]);
  const classified = useMemo(() => classifyJobs(allJobs), [allJobs]);

  // Filter by search query
  const filteredClassified = useMemo(() => {
    if (!searchQuery.trim()) return classified;
    const q = searchQuery.toLowerCase();
    const filterList = (list: Job[]) =>
      list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.scopeLabel?.toLowerCase().includes(q) ||
          j.scopeOutput?.toLowerCase().includes(q) ||
          j.messages.some((m) => m.content.toLowerCase().includes(q))
      );
    return {
      needsInput: filterList(classified.needsInput),
      runningQueued: filterList(classified.runningQueued),
      readyToReview: filterList(classified.readyToReview),
      monitoring: filterList(classified.monitoring),
      recentAnswers: filterList(classified.recentAnswers),
      archived: filterList(classified.archived),
    };
  }, [classified, searchQuery]);

  // inboxCount available for future use
  // const inboxCount = filteredClassified.needsInput.length + filteredClassified.runningQueued.length + filteredClassified.readyToReview.length + filteredClassified.monitoring.length;

  // ─── Handle actions ────────────────────────────────────────

  const handleSelectJob = (jobId: string) => {
    const job = jobsById[jobId];
    selectJob(jobId);
    if (job?.evidenceId) {
      setCurrentEvidence(job.evidenceId);
    }
  };

  const handleArchive = (jobId: string) => {
    const job = jobsById[jobId];
    if (job?.archived_at) {
      unarchiveJob(jobId);
    } else {
      archiveJob(jobId);
    }
  };

  const handleMakeRecurring = (jobId: string) => {
    openRecurrenceDialog(jobId);
  };

  const handleNewJob = () => {
    const id = createJob({
      title: 'New conversation',
      type: 'CONVERSATION',
      kind: 'tracked',
    });
    selectJob(id);
  };

  const handleSendMessage = (content: string) => {
    if (!selectedJobId) return;
    addMessage(selectedJobId, {
      id: `msg_${Date.now()}`,
      role: 'seller',
      timestamp: new Date().toISOString(),
      content,
    });
    processSellerMessage(selectedJobId, content);
  };

  // ─── Chat View (when a job is selected) ─────────────────

  if (selectedJob) {
    return (
      <div className="flex h-full w-full shrink-0 flex-col overflow-hidden bg-white">
        {/* Header with back button */}
        <div className="flex shrink-0 items-center gap-[8px] border-b px-[12px] py-[10px]" style={{ borderColor: 'var(--border-standard)' }}>
          <button
            className="flex shrink-0 items-center justify-center rounded-[4px] p-[4px] text-li-text-secondary transition-colors hover:bg-li-bg-hover"
            onClick={() => { selectJob(null); goHome(); }}
            title="Back to list"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-body text-ds-base font-semibold text-li-text-primary">
              {selectedJob.title}
            </span>
            {selectedJob.scopeOutput && (
              <span className="truncate font-body text-ds-small text-li-text-tertiary">
                {selectedJob.scopeOutput}
              </span>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto li-scrollbar">
            <ChatTranscript job={selectedJob} />
          </div>

          <ContextualSuggestions job={selectedJob} onSend={handleSendMessage} />
          <Composer onSend={handleSendMessage} />
        </div>
      </div>
    );
  }

  // ─── List View (no job selected) ───────────────────────

  return (
    <div className="flex h-full w-full shrink-0 flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex shrink-0 flex-col gap-[6px] px-[12px] py-[10px]" style={{ borderBottom: '1px solid var(--border-standard)' }}>
        {/* Title row: "Your Plays" left, Home icon right */}
        <div className="flex items-center justify-between">
          <h3 className="font-display text-[16px] font-semibold leading-snug text-li-text-primary">Your Plays</h3>
          <button
            className="flex shrink-0 items-center justify-center rounded-ds-button p-[4px] text-li-text-tertiary transition-colors hover:bg-li-bg-hover hover:text-li-text-secondary"
            title="Agent home"
            onClick={() => goHome()}
          >
            <Home size={16} />
          </button>
        </div>
        {/* Search + New in one row */}
        <div className="flex items-center gap-[6px]">
          {/* Search */}
          <div className="relative flex min-w-0 flex-1 items-center">
            <Search size={13} className="absolute left-[7px] text-li-text-disabled" />
            <input
              className="w-full rounded-ds-card border border-li-border-standard bg-li-bg-secondary py-[4px] pl-[26px] pr-[26px] font-body text-ds-small text-li-text-primary placeholder:text-li-text-disabled focus:border-li-blue focus:outline-none"
              placeholder={TERMS.SEARCH_PLAYS}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute right-[7px] text-li-text-tertiary hover:text-li-text-primary"
                onClick={() => setSearchQuery('')}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* New button */}
          <button
            className="flex shrink-0 items-center gap-[4px] rounded-ds-button bg-li-blue px-[10px] py-[5px] font-body text-ds-small font-semibold text-white transition-colors hover:bg-li-blue-dark"
            onClick={handleNewJob}
            title="New conversation"
          >
            <Plus size={14} />
            New
          </button>
        </div>
      </div>

      {/* Scrollable inbox sections */}
      {(() => {
        const categories = [
          { key: 'needsInput', title: 'Needs input', items: filteredClassified.needsInput, emptyMsg: 'No plays need input right now.' },
          { key: 'runningQueued', title: 'Running / Queued', items: filteredClassified.runningQueued, emptyMsg: 'No plays running.' },
          { key: 'readyToReview', title: 'Ready to review', items: filteredClassified.readyToReview, emptyMsg: 'No plays to review.' },
          { key: 'monitoring', title: 'Monitoring', items: filteredClassified.monitoring, emptyMsg: 'No plays being monitored.' },
        ];
        const withItems = categories.filter((c) => c.items.length > 0);
        const empty = categories.filter((c) => c.items.length === 0);

        return (
          <div className="flex flex-1 flex-col overflow-y-auto li-scrollbar">
            {/* Categories with plays — expanded at top */}
            {withItems.map((cat) => (
              <AgentSection key={cat.key} title={cat.title} count={cat.items.length} defaultExpanded>
                {cat.items.map((job) => (
                  <AgentJobRow key={job.id} job={job} selected={false} onSelect={handleSelectJob} onArchive={handleArchive} onDelete={deleteJob} onRename={renameJob} onMakeRecurring={handleMakeRecurring} />
                ))}
              </AgentSection>
            ))}

            {/* Spacer pushes empty sections and archived to the bottom */}
            <div className="flex-1" />

            {/* Empty categories — collapsed, pinned to bottom */}
            {empty.map((cat) => (
              <AgentSection key={cat.key} title={cat.title} count={0} defaultExpanded={false}>
                <p className="px-[16px] py-[8px] font-body text-[11px] text-li-text-disabled">{cat.emptyMsg}</p>
              </AgentSection>
            ))}

            {/* Archived — always last, always collapsed */}
            <AgentSection title="Archived" count={filteredClassified.archived.length} defaultExpanded={false}>
              {filteredClassified.archived.length > 0
                ? filteredClassified.archived.map((job) => (
                    <AgentJobRow key={job.id} job={job} selected={false} onSelect={handleSelectJob} onArchive={handleArchive} onDelete={deleteJob} onRename={renameJob} onMakeRecurring={handleMakeRecurring} />
                  ))
                : <p className="px-[16px] py-[8px] font-body text-[11px] text-li-text-disabled">No archived plays.</p>
              }
            </AgentSection>
          </div>
        );
      })()}
    </div>
  );
}
