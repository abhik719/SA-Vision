export interface Scope {
  territory?: string;
  segment?: string;
  timeWindowDays?: number;
  intentKey?: string;
}

export interface Attachment {
  type: 'EVIDENCE_LINK';
  evidenceId: string;
  label: string;
}

export type ThreadType = 'PRIORITIZE' | 'LEADS' | 'OUTREACH' | 'MIXED';

export type JobType =
  | 'FIND_LEADS'
  | 'DRAFT_OUTREACH'
  | 'PRIORITIZE'
  | 'ANALYZE'
  | 'PRIORITIZE_ACCOUNTS'
  | 'MULTITHREAD_PLAN'
  | 'OUTREACH_SEQUENCE'
  | 'MONITOR'
  | 'CONVERSATION';

export type JobStatus =
  | 'NEW'              // Created but no action taken
  | 'QUEUED'           // Approved by user to run, queued by system
  | 'SCHEDULED'        // Scheduled to run at a different time
  | 'NEEDS_INPUT'      // User input required (can happen at multiple steps)
  | 'RUNNING'          // Currently running
  | 'READY_TO_REVIEW'  // Completed all steps, outputs ready for review
  | 'ARCHIVED';        // Archived / done

export type JobKind = 'tracked' | 'ephemeral';

export type EvidenceType =
  | 'AGENT_HOME'
  | 'ACCOUNTS_RANKED_TABLE'
  | 'ACCOUNTS_DIFF_VIEW'
  | 'LEADS_TABLE'
  | 'JOB_RUNNING'
  | 'JOB_RESULTS'
  | 'APPROVAL_QUEUE'
  | 'SIGNAL_DETAIL'
  | 'NEEDS_ATTENTION'
  | 'CONFIGURATION'
  | 'OUTREACH_PLAN_BUILDER'
  | 'OUTREACH_DRAFT_REVIEW'
  | 'EXECUTION_MONITOR'
  | 'REASONING_ANIMATION'
  | 'ACCOUNTS_PRIORITIZED'
  | 'LEADS_DISCOVERY'
  | 'SCHEDULE_AND_RUN';

export type SelectedView = 'HOME' | 'JOB' | 'ONBOARDING';

export type DraftStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EDITED' | 'SENT' | 'QUEUED_EXEC';
