import type { JobStatus, JobType } from './common';

export interface JobSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number;
  timeOfDay?: string;
  onlyOnSignalChange?: boolean;
}

export interface Job {
  id: string;
  originThreadId: string;
  type: JobType;
  title: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  /** When the user first viewed completed results */
  viewedAt?: string;
  /** Soft-archived by user */
  archived?: boolean;
  /** Recurring schedule */
  schedule?: JobSchedule;
  /** Message ID in origin thread where this job was created */
  createdFromMessageId?: string;
  /** Human-readable "Scope → Outcome" subtitle */
  scopeOutput?: string;
  inputs: {
    accountIds?: string[];
    personas?: string[];
    seniority?: string[];
    constraints?: string[];
    leadIds?: string[];
    [key: string]: unknown;
  };
  outputs?: {
    leadIds?: string[];
    draftIds?: string[];
    summary?: {
      leadsFound?: number;
      accountsCovered?: number;
      coverageGaps?: number;
      draftsCreated?: number;
      draftsApproved?: number;
    };
  };
  evidenceId?: string;
  /** Progress simulation stages */
  progressStages?: string[];
  currentStage?: number;
}
