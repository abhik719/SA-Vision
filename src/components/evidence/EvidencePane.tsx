import { useAppStore } from '../../store/useAppStore';
import { useEvidenceStore } from '../../store/useEvidenceStore';
import { TERMS } from '../../constants/terms';
import { useJobStore } from '../../store/useJobStore';
import EvidenceBreadcrumb from './EvidenceBreadcrumb';
import AgentHome from './AgentHome';
import AccountsRankedTable from './AccountsRankedTable';
import AccountsDiffView from './AccountsDiffView';
import LeadsTable from './LeadsTable';
import JobRunning from './JobRunning';
import JobResults from './JobResults';
import SignalDetail from './SignalDetail';
import ApprovalQueue from './ApprovalQueue';
import NeedsAttentionView from './NeedsAttentionView';
import ConfigurationView from './ConfigurationView';
import OutreachPlanBuilder from './OutreachPlanBuilder';
import OutreachDraftReview from './OutreachDraftReview';
import ExecutionMonitor from './ExecutionMonitor';
import ScheduleAndRun from './ScheduleAndRun';
import EvidenceJobHeader from './EvidenceJobHeader';
import ReasoningAnimation from './ReasoningAnimation';
import AccountsPrioritized from './AccountsPrioritized';
import LeadsDiscovery from './LeadsDiscovery';
import RecurrenceDialog from '../control-plane/RecurrenceDialog';

import PlayTimeline from './PlayTimeline';
import PlayExecutionStatus from './PlayExecutionStatus';

export default function EvidencePane() {
  const currentEvidenceId = useAppStore((s) => s.currentEvidenceId);
  const selectedView = useAppStore((s) => s.selectedView);
  const selectedJobId = useAppStore((s) => s.selectedJobId);
  const evidenceById = useEvidenceStore((s) => s.evidenceById);
  const jobsById = useJobStore((s) => s.jobsById);

  // Resolve evidence: current evidence ID, or from selected job
  let evidence = currentEvidenceId ? evidenceById[currentEvidenceId] : null;

  // Fallback: if we have a selected job with evidence, use that
  if (!evidence && selectedJobId) {
    const job = jobsById[selectedJobId];
    if (job?.evidenceId) {
      evidence = evidenceById[job.evidenceId];
    }
  }

  // Resolve job for header rendering
  const job = selectedJobId ? jobsById[selectedJobId] : null;

  // Recurrence dialog state
  const recurrenceDialogJobId = useAppStore((s) => s.recurrenceDialogJobId);
  const closeRecurrenceDialog = useAppStore((s) => s.closeRecurrenceDialog);
  const recurrenceJob = recurrenceDialogJobId ? jobsById[recurrenceDialogJobId] : null;

  // Determine context label for breadcrumb
  let contextLabel = '';
  let showBreadcrumb = false;

  if (selectedView === 'JOB' && selectedJobId) {
    contextLabel = job?.title || TERMS.PLAY_SINGULAR;
    showBreadcrumb = true;
  } else if (evidence && evidence.type !== 'AGENT_HOME') {
    contextLabel = evidence.title || 'Evidence';
    showBreadcrumb = true;
  }

  // ─── Play workspace: detect play_001 ───
  const isPlay = selectedJobId === 'play_001';
  const setCurrentEvidence = useAppStore((s) => s.setCurrentEvidence);
  const playProgressStep = useAppStore((s) => s.playProgressStep);
  const advancePlayProgress = useAppStore((s) => s.advancePlayProgress);

  // Map step index → evidence ID patterns (for deriving step from evidence)
  const evIdToStep = (evId: string): number => {
    // Accounts step: play-filtered account views + quick play card account views
    if (evId.startsWith('ev_play_accounts') || evId === 'ev_prioritize_accounts' || evId === 'ev_prioritize_result' || evId === 'ev_prioritize_reasoning' || evId.startsWith('ev_quick_') && evId.includes('_accounts') || evId.startsWith('ev_quick_') && evId.includes('_reasoning') && !evId.includes('_leads_')) return 0;
    // Leads step: play leads + quick play card leads
    if (evId.startsWith('ev_play_leads') || evId === 'ev_leads_reasoning' || evId === 'ev_leads_discovery' || evId === 'ev_leads_final' || evId === 'ev_3102' || evId.startsWith('ev_quick_') && evId.includes('_leads')) return 1;
    if (evId.startsWith('ev_outreach_plan') || evId.startsWith('ev_outreach_collab_plan') || evId === 'ev_prioritize_outreach_plan') return 2;
    if (evId.startsWith('ev_outreach_collab_drafts') || evId.startsWith('ev_outreach_draft') || evId === 'ev_prioritize_outreach_drafts') return 3;
    if (evId.startsWith('ev_execution') || evId.startsWith('ev_schedule')) return 4;
    return 0; // accounts step
  };

  // Derive the play step from current evidence
  const getPlayStep = (): number => evIdToStep(evidence?.id || '');

  const getPlayStepNote = (): string | undefined => {
    const evId = evidence?.id || '';
    if (evId === 'ev_prioritize_reasoning' || (evId.startsWith('ev_quick_') && evId.endsWith('_reasoning') && !evId.includes('_leads_'))) return 'Analyzing...';
    if (evId === 'ev_leads_reasoning' || evId === 'ev_play_leads_reasoning' || (evId.startsWith('ev_quick_') && evId.includes('_leads_reasoning'))) return 'Scanning leads...';
    if (evId === 'ev_prioritize_outreach_plan') return 'Review plan';
    if (evId === 'ev_prioritize_outreach_drafts') return 'Review drafts';
    return undefined;
  };

  // Advance progress when the user reaches a new step (ratchets upward only)
  const currentPlayStep = getPlayStep();
  if (isPlay && currentPlayStep > playProgressStep) {
    advancePlayProgress(currentPlayStep);
  }

  // Step → preferred evidence ID (first one that exists in the store wins)
  // Include quick play card-specific evidence IDs
  const STEP_EVIDENCE_CANDIDATES: Record<number, string[]> = {
    0: [
      'ev_play_accounts_untouched', 'ev_play_accounts_leadership',
      'ev_quick_ai_growth_accounts', 'ev_quick_midsize_sw_accounts', 'ev_quick_hiring_gtm_accounts', 'ev_quick_funded_accounts',
      'ev_prioritize_accounts', 'ev_prioritize_result',
    ],
    1: [
      'ev_quick_leads_filtered', 'ev_play_leads_filtered',
      'ev_quick_ai_growth_leads', 'ev_quick_midsize_sw_leads', 'ev_quick_hiring_gtm_leads', 'ev_quick_funded_leads',
      'ev_leads_final', 'ev_leads_discovery',
    ],
    2: ['ev_prioritize_outreach_plan', 'ev_outreach_collab_plan', 'ev_outreach_plan_01'],
    3: ['ev_prioritize_outreach_drafts', 'ev_outreach_collab_drafts', 'ev_outreach_drafts_01'],
    4: ['ev_schedule_and_run', 'ev_outreach_exec_01'],
  };

  const handlePlayStepClick = (step: number) => {
    const candidates = STEP_EVIDENCE_CANDIDATES[step] || [];
    for (const evId of candidates) {
      if (evidenceById[evId]) {
        setCurrentEvidence(evId);
        return;
      }
    }
  };

  // ─── Content renderer (hoisted so play branch can use it) ───
  const renderContent = () => {
    if (!evidence) return null;
    switch (evidence.type) {
      case 'ACCOUNTS_RANKED_TABLE':
        return <AccountsRankedTable evidence={evidence} hideHeader />;
      case 'ACCOUNTS_DIFF_VIEW':
        return <AccountsDiffView evidence={evidence} hideHeader />;
      case 'LEADS_TABLE':
        return <LeadsTable evidence={evidence} hideHeader />;
      case 'JOB_RUNNING':
        return <JobRunning evidence={evidence} hideHeader />;
      case 'JOB_RESULTS':
        return <JobResults evidence={evidence} hideHeader />;
      case 'SIGNAL_DETAIL':
        return <SignalDetail evidence={evidence} />;
      case 'APPROVAL_QUEUE':
        return <ApprovalQueue evidence={evidence} hideHeader />;
      case 'NEEDS_ATTENTION':
        return <NeedsAttentionView evidence={evidence} />;
      case 'CONFIGURATION':
        return <ConfigurationView evidence={evidence} />;
      case 'OUTREACH_PLAN_BUILDER':
        return <OutreachPlanBuilder evidence={evidence} />;
      case 'OUTREACH_DRAFT_REVIEW':
        return <OutreachDraftReview evidence={evidence} />;
      case 'EXECUTION_MONITOR':
        return <ExecutionMonitor evidence={evidence} />;
      case 'SCHEDULE_AND_RUN':
        return <ScheduleAndRun evidence={evidence} />;
      case 'REASONING_ANIMATION':
        return <ReasoningAnimation evidence={evidence} />;
      case 'ACCOUNTS_PRIORITIZED':
        return <AccountsPrioritized evidence={evidence} hideHeader />;
      case 'LEADS_DISCOVERY':
        return <LeadsDiscovery evidence={evidence} hideHeader />;
      default:
        return (
          <div className="flex h-full items-center justify-center">
            <span className="font-body text-ds-base text-li-text-tertiary">
              Unknown evidence type: {evidence.type}
            </span>
          </div>
        );
    }
  };

  // ─── Play workspace: show timeline for play_001 instead of JobRunning ───
  const isPlayMonitoring = isPlay && (job?.schedule?.is_active || job?.status === 'SCHEDULED');

  // ─── Build inner content (single return with dialog overlay) ───
  const renderPane = (): React.ReactNode => {
    if (isPlay && selectedView === 'JOB' && job) {
      // Monitoring state: all steps completed, show execution status
      if (isPlayMonitoring) {
        return (
          <div className="flex h-full flex-col">
            {showBreadcrumb && <EvidenceBreadcrumb contextLabel={contextLabel} />}
            <EvidenceJobHeader job={job} />
            <PlayTimeline
              currentStep={4}
              progressStep={4}
              stepNote="Monitoring"
              onStepClick={handlePlayStepClick}
            />
            <div className="flex-1 overflow-hidden">
              <PlayExecutionStatus />
            </div>
          </div>
        );
      }

      // Normal play progression
      if (evidence) {
        return (
          <div className="flex h-full flex-col">
            {showBreadcrumb && <EvidenceBreadcrumb contextLabel={contextLabel} />}
            <EvidenceJobHeader job={job} />
            <PlayTimeline
              currentStep={getPlayStep()}
              progressStep={playProgressStep}
              stepNote={getPlayStepNote()}
              onStepClick={handlePlayStepClick}
            />
            <div className="flex-1 overflow-hidden">{renderContent()}</div>
          </div>
        );
      }
    }

    // If job is selected and status is RUNNING but evidence is not JOB_RUNNING type,
    // show running view (non-play jobs only)
    if (selectedView === 'JOB' && selectedJobId && job && !isPlay) {
      if (
        (job.status === 'QUEUED' || job.status === 'RUNNING') &&
        evidence?.type !== 'JOB_RUNNING' &&
        job.type !== 'OUTREACH_SEQUENCE'
      ) {
        return (
          <div className="flex h-full flex-col">
            {showBreadcrumb && <EvidenceBreadcrumb contextLabel={contextLabel} />}
            <EvidenceJobHeader job={job} />
            <div className="flex-1 overflow-hidden">
              <JobRunning
                evidence={{
                  id: 'temp_running',
                  type: 'JOB_RUNNING',
                  title: job.title,
                  generatedAt: job.createdAt,
                  stages: job.progressStages || ['Processing'],
                  currentStage: job.currentStage ?? 0,
                  log: [],
                }}
                hideHeader
              />
            </div>
          </div>
        );
      }
    }

    if (!evidence) {
      const homeEvidence = evidenceById['ev_home'];
      if (homeEvidence) return <AgentHome evidence={homeEvidence} />;
      return (
        <div className="flex h-full items-center justify-center">
          <span className="font-body text-ds-base text-li-text-tertiary">
            {TERMS.SELECT_PLAY}
          </span>
        </div>
      );
    }

    if (evidence.type === 'AGENT_HOME') {
      return <AgentHome evidence={evidence} />;
    }

    return (
      <div className="flex h-full flex-col">
        {showBreadcrumb && <EvidenceBreadcrumb contextLabel={contextLabel} />}
        {selectedView === 'JOB' && job ? <EvidenceJobHeader job={job} /> : null}
        <div className="flex-1 overflow-hidden">{renderContent()}</div>
      </div>
    );
  };

  return (
    <>
      {renderPane()}
      {recurrenceJob && (
        <RecurrenceDialog
          jobId={recurrenceJob.id}
          jobTitle={recurrenceJob.title}
          onClose={closeRecurrenceDialog}
        />
      )}
    </>
  );
}
