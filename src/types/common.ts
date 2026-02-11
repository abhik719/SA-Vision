export interface Scope {
  territory?: string;
  segment?: string;
  timeWindowDays?: number;
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
  | 'OUTREACH_SEQUENCE';

export type JobStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'NEEDS_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'DRAFTING'
  | 'NEEDS_INPUT'
  | 'READY';

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
  | 'EXECUTION_MONITOR';

export type SelectedView = 'HOME' | 'THREAD' | 'JOB';

export type ActiveTab = 'THREADS' | 'JOBS';

export type DraftStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EDITED' | 'SENT' | 'QUEUED_EXEC';
