import { useMemo, useState } from 'react';
import { ArrowLeft, Home, Plus, Search, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
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
    // Archived first
    if (job.archived_at) {
      result.archived.push(job);
      continue;
    }
    // Monitoring (schedule-based)
    if (job.schedule?.is_active) {
      result.monitoring.push(job);
      continue;
    }
    // Needs input / blocked
    if (job.status === 'NEEDS_INPUT' || job.status === 'BLOCKED') {
      result.needsInput.push(job);
      continue;
    }
    // Running / queued
    if (job.status === 'RUNNING' || job.status === 'QUEUED') {
      result.runningQueued.push(job);
      continue;
    }
    // Ready to review
    if (job.status === 'READY_TO_REVIEW' || (job.status === 'COMPLETED' && job.has_unread_results)) {
      result.readyToReview.push(job);
      continue;
    }
    // Ephemeral = recent answers
    if (job.kind === 'ephemeral' && job.status === 'COMPLETED' && !job.archived_at) {
      const expiry = job.expires_at ? new Date(job.expires_at).getTime() : Infinity;
      if (expiry > now) {
        result.recentAnswers.push(job);
        continue;
      }
    }
    // Completed tracked with no unread = could be a workspace conversation
    if (job.status === 'COMPLETED' && job.type === 'CONVERSATION' && !job.archived_at) {
      // Show workspace conversations in recent answers area
      result.recentAnswers.push(job);
      continue;
    }
    // Completed non-conversation jobs just end up in archived conceptually
    if (job.status === 'COMPLETED') {
      result.archived.push(job);
      continue;
    }
    // Fallback for cancelled
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

  const inboxCount =
    filteredClassified.needsInput.length +
    filteredClassified.runningQueued.length +
    filteredClassified.readyToReview.length +
    filteredClassified.monitoring.length;

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
      <div className="flex h-full shrink-0 flex-col overflow-hidden bg-white" style={{ width: 411 }}>
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
              <span className="truncate font-body text-[11px] text-li-text-tertiary">
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
    <div className="flex h-full shrink-0 flex-col overflow-hidden bg-white" style={{ width: 411 }}>
      {/* Header */}
      <div className="flex shrink-0 items-center gap-[6px] px-[12px] py-[10px]" style={{ borderBottom: '1px solid var(--border-standard)' }}>
        {/* Search */}
        <div className="relative flex flex-1 items-center">
          <Search size={14} className="absolute left-[8px] text-li-text-disabled" />
          <input
            className="w-full rounded-ds-card border border-li-border-standard bg-li-bg-secondary py-[6px] pl-[28px] pr-[28px] font-body text-ds-base text-li-text-primary placeholder:text-li-text-disabled focus:border-li-blue focus:outline-none"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute right-[8px] text-li-text-tertiary hover:text-li-text-primary"
              onClick={() => setSearchQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Home button */}
        <button
          className="flex shrink-0 items-center justify-center rounded-ds-button p-[5px] text-li-text-tertiary transition-colors hover:bg-li-bg-hover hover:text-li-text-secondary"
          title="Agent home"
          onClick={() => goHome()}
        >
          <Home size={16} />
        </button>

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

      {/* Scrollable inbox sections */}
      <div className="flex-1 overflow-y-auto li-scrollbar">
        {inboxCount > 0 && (
          <>
            {filteredClassified.needsInput.length > 0 && (
              <AgentSection title="Needs input" count={filteredClassified.needsInput.length} defaultExpanded>
                {filteredClassified.needsInput.map((job) => (
                  <AgentJobRow
                    key={job.id}
                    job={job}
                    selected={false}
                    onSelect={handleSelectJob}
                    onArchive={handleArchive}
                    onDelete={deleteJob}
                    onRename={renameJob}
                  />
                ))}
              </AgentSection>
            )}

            {filteredClassified.runningQueued.length > 0 && (
              <AgentSection title="Running / Queued" count={filteredClassified.runningQueued.length} defaultExpanded>
                {filteredClassified.runningQueued.map((job) => (
                  <AgentJobRow
                    key={job.id}
                    job={job}
                    selected={false}
                    onSelect={handleSelectJob}
                    onArchive={handleArchive}
                    onDelete={deleteJob}
                    onRename={renameJob}
                  />
                ))}
              </AgentSection>
            )}

            {filteredClassified.readyToReview.length > 0 && (
              <AgentSection title="Ready to review" count={filteredClassified.readyToReview.length} defaultExpanded>
                {filteredClassified.readyToReview.map((job) => (
                  <AgentJobRow
                    key={job.id}
                    job={job}
                    selected={false}
                    onSelect={handleSelectJob}
                    onArchive={handleArchive}
                    onDelete={deleteJob}
                    onRename={renameJob}
                  />
                ))}
              </AgentSection>
            )}

            {filteredClassified.monitoring.length > 0 && (
              <AgentSection title="Monitoring" count={filteredClassified.monitoring.length} defaultExpanded>
                {filteredClassified.monitoring.map((job) => (
                  <AgentJobRow
                    key={job.id}
                    job={job}
                    selected={false}
                    onSelect={handleSelectJob}
                    onArchive={handleArchive}
                    onDelete={deleteJob}
                    onRename={renameJob}
                  />
                ))}
              </AgentSection>
            )}
          </>
        )}

        {/* Empty state */}
        {allJobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-[48px] text-center">
            <p className="font-body text-ds-base text-li-text-tertiary">
              No jobs yet. Start a conversation from Agent Home.
            </p>
          </div>
        )}
      </div>

      {/* Bottom-pinned: Recent conversations + Archived */}
      {(filteredClassified.recentAnswers.length > 0 || filteredClassified.archived.length > 0) && (
        <div className="shrink-0 overflow-y-auto li-scrollbar" style={{ maxHeight: '40%', borderTop: '1px solid var(--border-standard)' }}>
          {filteredClassified.recentAnswers.length > 0 && (
            <AgentSection
              title="Recent conversations"
              count={filteredClassified.recentAnswers.length}
              defaultExpanded={false}
            >
              {filteredClassified.recentAnswers.map((job) => (
                <AgentJobRow
                  key={job.id}
                  job={job}
                  selected={false}
                  onSelect={handleSelectJob}
                  onArchive={handleArchive}
                  onDelete={deleteJob}
                  onRename={renameJob}
                />
              ))}
            </AgentSection>
          )}

          {filteredClassified.archived.length > 0 && (
            <AgentSection title="Archived" count={filteredClassified.archived.length} defaultExpanded={false}>
              {filteredClassified.archived.map((job) => (
                <AgentJobRow
                  key={job.id}
                  job={job}
                  selected={false}
                  onSelect={handleSelectJob}
                  onArchive={handleArchive}
                  onDelete={deleteJob}
                  onRename={renameJob}
                />
              ))}
            </AgentSection>
          )}
        </div>
      )}
    </div>
  );
}
