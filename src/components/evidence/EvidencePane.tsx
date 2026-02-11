import { useAppStore } from '../../store/useAppStore';
import { useEvidenceStore } from '../../store/useEvidenceStore';
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
import EvidenceJobHeader from './EvidenceJobHeader';
import ReasoningAnimation from './ReasoningAnimation';
import AccountsPrioritized from './AccountsPrioritized';
import LeadsDiscovery from './LeadsDiscovery';
import LeadsFinalList from './LeadsFinalList';

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

  // Determine context label for breadcrumb
  let contextLabel = '';
  let showBreadcrumb = false;

  if (selectedView === 'JOB' && selectedJobId) {
    contextLabel = job?.title || 'Job';
    showBreadcrumb = true;
  } else if (evidence && evidence.type !== 'AGENT_HOME') {
    contextLabel = evidence.title || 'Evidence';
    showBreadcrumb = true;
  }

  // If job is selected and status is RUNNING but evidence is not JOB_RUNNING type,
  // show running view
  if (selectedView === 'JOB' && selectedJobId && job) {
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
          Select a job to see details
        </span>
      </div>
    );
  }

  if (evidence.type === 'AGENT_HOME') {
    return <AgentHome evidence={evidence} />;
  }

  const renderContextHeader = () => {
    if (selectedView === 'JOB' && job) {
      return <EvidenceJobHeader job={job} />;
    }
    return null;
  };

  const renderContent = () => {
    switch (evidence!.type) {
      case 'ACCOUNTS_RANKED_TABLE':
        return <AccountsRankedTable evidence={evidence!} hideHeader />;
      case 'ACCOUNTS_DIFF_VIEW':
        return <AccountsDiffView evidence={evidence!} hideHeader />;
      case 'LEADS_TABLE':
        return <LeadsTable evidence={evidence!} hideHeader />;
      case 'JOB_RUNNING':
        return <JobRunning evidence={evidence!} hideHeader />;
      case 'JOB_RESULTS':
        return <JobResults evidence={evidence!} hideHeader />;
      case 'SIGNAL_DETAIL':
        return <SignalDetail evidence={evidence!} />;
      case 'APPROVAL_QUEUE':
        return <ApprovalQueue evidence={evidence!} hideHeader />;
      case 'NEEDS_ATTENTION':
        return <NeedsAttentionView evidence={evidence!} />;
      case 'CONFIGURATION':
        return <ConfigurationView evidence={evidence!} />;
      case 'OUTREACH_PLAN_BUILDER':
        return <OutreachPlanBuilder evidence={evidence!} />;
      case 'OUTREACH_DRAFT_REVIEW':
        return <OutreachDraftReview evidence={evidence!} />;
      case 'EXECUTION_MONITOR':
        return <ExecutionMonitor evidence={evidence!} />;
      case 'REASONING_ANIMATION':
        return <ReasoningAnimation evidence={evidence!} />;
      case 'ACCOUNTS_PRIORITIZED':
        return <AccountsPrioritized evidence={evidence!} hideHeader />;
      case 'LEADS_DISCOVERY':
        // Use LeadsFinalList for the final view (ev_leads_final)
        if (evidence!.id === 'ev_leads_final') {
          return <LeadsFinalList evidence={evidence!} hideHeader />;
        }
        return <LeadsDiscovery evidence={evidence!} hideHeader />;
      default:
        return (
          <div className="flex h-full items-center justify-center">
            <span className="font-body text-ds-base text-li-text-tertiary">
              Unknown evidence type: {evidence!.type}
            </span>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full flex-col">
      {showBreadcrumb && <EvidenceBreadcrumb contextLabel={contextLabel} />}
      {renderContextHeader()}
      <div className="flex-1 overflow-hidden">{renderContent()}</div>
    </div>
  );
}
