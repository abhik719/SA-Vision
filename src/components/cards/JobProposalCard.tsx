import type { JobProposalCardData } from '../../types/thread';
import { useAppStore } from '../../store/useAppStore';
import { useJobStore } from '../../store/useJobStore';
import { useEvidenceStore } from '../../store/useEvidenceStore';
import Button from '../ui/Button';
import { Play, Settings, X } from 'lucide-react';
import type { JobType } from '../../types/common';

interface Props {
  data: JobProposalCardData;
  jobId: string;
}

let jobCounter = 4000;

export default function JobProposalCard({ data, jobId }: Props) {
  const selectJob = useAppStore((s) => s.selectJob);
  const setCurrentEvidence = useAppStore((s) => s.setCurrentEvidence);
  const { createJobDirect, addSpawnedJob } = useJobStore.getState();
  const setEvidence = useEvidenceStore((s) => s.setEvidence);

  const handleRun = () => {
    const childJobId = `job_${++jobCounter}`;
    const evidenceId = `ev_run_${childJobId}`;
    const now = new Date().toISOString();

    setEvidence(evidenceId, {
      id: evidenceId,
      type: 'JOB_RUNNING',
      title: data.jobName,
      generatedAt: now,
      stages: ['Initializing', 'Scanning data', 'Processing', 'Finalizing', 'Complete'],
      currentStage: 0,
      log: [{ time: new Date().toLocaleTimeString(), message: 'Job started' }],
    });

    createJobDirect({
      id: childJobId,
      kind: 'tracked',
      type: (data.jobType as JobType) || 'ANALYZE',
      title: data.jobName,
      status: 'QUEUED',
      has_unread_results: false,
      createdAt: now,
      updatedAt: now,
      last_viewed_at: null,
      expires_at: null,
      archived_at: null,
      schedule: null,
      linked_context: { parent_job_id: jobId },
      evidenceId,
      inputs: data.jobInputs || {},
      messages: [],
      progressStages: ['Initializing', 'Scanning data', 'Processing', 'Finalizing', 'Complete'],
      currentStage: 0,
    });

    addSpawnedJob(jobId, childJobId);
    selectJob(childJobId);
    setCurrentEvidence(evidenceId);

    simulateJobProgress(childJobId, evidenceId, data, jobId);
  };

  return (
    <div className="li-card max-w-[95%] p-[16px]">
      <div className="flex flex-col gap-[10px]">
        <div className="font-body text-ds-base font-semibold text-li-text-primary">
          {data.jobName}
        </div>

        <div className="flex flex-col gap-[4px]">
          <span className="font-body text-ds-small font-semibold text-li-text-tertiary">
            Inputs
          </span>
          <ul className="flex flex-col gap-[2px] pl-[12px]">
            {data.inputsSummary.map((inp, i) => (
              <li
                key={i}
                className="font-body text-ds-small text-li-text-secondary"
              >
                &bull; {inp}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-[4px]">
          <span className="font-body text-ds-small font-semibold text-li-text-tertiary">
            Expected outputs
          </span>
          <ul className="flex flex-col gap-[2px] pl-[12px]">
            {data.outputsExpected.map((out, i) => (
              <li
                key={i}
                className="font-body text-ds-small text-li-text-secondary"
              >
                &bull; {out}
              </li>
            ))}
          </ul>
        </div>

        {data.approvalsNeeded && (
          <div className="flex items-center gap-[6px]">
            <div className="h-[16px] w-[28px] rounded-full bg-li-blue p-[2px]">
              <div className="ml-auto h-[12px] w-[12px] rounded-full bg-white" />
            </div>
            <span className="font-body text-ds-small text-li-text-secondary">
              Approval required before sending
            </span>
          </div>
        )}

        <div className="flex items-center gap-[8px]">
          <Button onClick={handleRun} size="sm">
            <Play size={12} className="mr-[4px]" /> Run job
          </Button>
          <Button variant="secondary" size="sm">
            <Settings size={12} className="mr-[4px]" /> Edit inputs
          </Button>
          <Button variant="ghost" size="sm">
            <X size={12} className="mr-[4px]" /> Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

function simulateJobProgress(
  childJobId: string,
  evidenceId: string,
  data: JobProposalCardData,
  parentJobId: string
) {
  const { setJobStatus, updateJobProgress, updateJob, addMessage } =
    useJobStore.getState();
  const { updateEvidence } = useEvidenceStore.getState();
  const { setCurrentEvidence } = useAppStore.getState();

  // QUEUED -> RUNNING
  setTimeout(() => {
    setJobStatus(childJobId, 'RUNNING');
    updateJobProgress(childJobId, 1);
    updateEvidence(evidenceId, {
      currentStage: 1,
      log: [
        { time: new Date().toLocaleTimeString(), message: 'Job started' },
        { time: new Date().toLocaleTimeString(), message: 'Scanning data...' },
      ],
    });
  }, 800);

  setTimeout(() => {
    updateJobProgress(childJobId, 2);
    updateEvidence(evidenceId, {
      currentStage: 2,
      log: [
        { time: new Date().toLocaleTimeString(), message: 'Job started' },
        { time: new Date().toLocaleTimeString(), message: 'Scanning data...' },
        { time: new Date().toLocaleTimeString(), message: 'Processing results...' },
      ],
    });
  }, 2500);

  setTimeout(() => {
    updateJobProgress(childJobId, 3);
    updateEvidence(evidenceId, {
      currentStage: 3,
      log: [
        { time: new Date().toLocaleTimeString(), message: 'Job started' },
        { time: new Date().toLocaleTimeString(), message: 'Scanning data...' },
        { time: new Date().toLocaleTimeString(), message: 'Processing results...' },
        { time: new Date().toLocaleTimeString(), message: 'Finalizing...' },
      ],
    });
  }, 4000);

  // Complete
  setTimeout(() => {
    const needsApproval = data.approvalsNeeded;
    if (needsApproval) {
      setJobStatus(childJobId, 'NEEDS_INPUT');
    } else {
      setJobStatus(childJobId, 'COMPLETED');
      updateJob(childJobId, { has_unread_results: true });
    }
    updateJobProgress(childJobId, 4);

    const { jobsById: latestJobs } = useJobStore.getState();
    const completedJob = latestJobs[childJobId];
    if (completedJob?.evidenceId) {
      setCurrentEvidence(completedJob.evidenceId);
    }

    // Post result card back to parent job
    addMessage(parentJobId, {
      id: `msg_${Date.now()}`,
      role: 'agent',
      timestamp: new Date().toISOString(),
      content: needsApproval
        ? `Job "${data.jobName}" is ready for your review.`
        : `Job "${data.jobName}" completed successfully.`,
      cardType: 'JOB_RESULT',
      cardData: {
        jobId: childJobId,
        jobTitle: data.jobName,
        completedTime: new Date().toISOString(),
        highlights: needsApproval
          ? ['Drafts ready for approval']
          : ['Results ready for review'],
      },
    });
  }, 6000);
}
