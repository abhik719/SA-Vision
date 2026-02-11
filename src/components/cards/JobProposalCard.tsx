import type { JobProposalCardData } from '../../types/thread';
import { useAppStore } from '../../store/useAppStore';
import { useJobStore } from '../../store/useJobStore';
import { useThreadStore } from '../../store/useThreadStore';
import { useEvidenceStore } from '../../store/useEvidenceStore';
import Button from '../ui/Button';
import { Play, Settings, X } from 'lucide-react';

interface Props {
  data: JobProposalCardData;
  threadId: string;
}

let jobCounter = 4000;

export default function JobProposalCard({ data, threadId }: Props) {
  const selectJob = useAppStore((s) => s.selectJob);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const setCurrentEvidence = useAppStore((s) => s.setCurrentEvidence);
  const createJob = useJobStore((s) => s.createJob);
  const addSpawnedJob = useThreadStore((s) => s.addSpawnedJob);
  const setEvidence = useEvidenceStore((s) => s.setEvidence);

  const handleRun = () => {
    const jobId = `job_${++jobCounter}`;
    const evidenceId = `ev_run_${jobId}`;
    const now = new Date().toISOString();

    // Create running evidence
    setEvidence(evidenceId, {
      id: evidenceId,
      type: 'JOB_RUNNING',
      title: data.jobName,
      generatedAt: now,
      stages: ['Initializing', 'Scanning data', 'Processing', 'Finalizing', 'Complete'],
      currentStage: 0,
      log: [{ time: new Date().toLocaleTimeString(), message: 'Job started' }],
    });

    createJob({
      id: jobId,
      originThreadId: threadId,
      type: data.jobType as import('../../types/common').JobType,
      title: data.jobName,
      status: 'QUEUED',
      createdAt: now,
      updatedAt: now,
      inputs: data.jobInputs || {},
      evidenceId,
      progressStages: ['Initializing', 'Scanning data', 'Processing', 'Finalizing', 'Complete'],
      currentStage: 0,
    });

    addSpawnedJob(threadId, jobId);
    setActiveTab('JOBS');
    selectJob(jobId);
    setCurrentEvidence(evidenceId);

    // Simulate progress
    simulateJobProgress(jobId, evidenceId, data);
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
  jobId: string,
  evidenceId: string,
  data: JobProposalCardData
) {
  const { advanceJobStatus, updateJobProgress, setJobStatus } =
    useJobStore.getState();
  const { updateEvidence } = useEvidenceStore.getState();
  const { addMessage, updateMiniOutcome } = useThreadStore.getState();
  const { setCurrentEvidence } = useAppStore.getState();
  const { jobsById } = useJobStore.getState();
  const job = jobsById[jobId];
  const threadId = job?.originThreadId;

  // QUEUED -> RUNNING
  setTimeout(() => {
    advanceJobStatus(jobId);
    updateJobProgress(jobId, 1);
    updateEvidence(evidenceId, {
      currentStage: 1,
      log: [
        { time: new Date().toLocaleTimeString(), message: 'Job started' },
        { time: new Date().toLocaleTimeString(), message: 'Scanning data...' },
      ],
    });
  }, 800);

  setTimeout(() => {
    updateJobProgress(jobId, 2);
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
    updateJobProgress(jobId, 3);
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
      setJobStatus(jobId, 'NEEDS_APPROVAL');
    } else {
      setJobStatus(jobId, 'COMPLETED');
    }
    updateJobProgress(jobId, 4);

    // Switch evidence to results
    const { jobsById: latestJobs } = useJobStore.getState();
    const completedJob = latestJobs[jobId];
    if (completedJob?.evidenceId) {
      setCurrentEvidence(completedJob.evidenceId);
    }

    // Post result card back to thread
    if (threadId) {
      addMessage(threadId, {
        id: `msg_${Date.now()}`,
        role: 'agent',
        timestamp: new Date().toISOString(),
        content: needsApproval
          ? `Job "${data.jobName}" is ready for your review.`
          : `Job "${data.jobName}" completed successfully.`,
        cardType: 'JOB_RESULT',
        cardData: {
          jobId,
          jobTitle: data.jobName,
          completedTime: new Date().toISOString(),
          highlights: needsApproval
            ? ['Drafts ready for approval']
            : ['Results ready for review'],
        },
      });
      updateMiniOutcome(
        threadId,
        needsApproval ? 'Drafts awaiting approval' : `Completed: ${data.jobName}`
      );
    }
  }, 6000);
}
