import type { JobStatus, JobType, JobKind, Scope } from './common';
import type { Message, NextSuggestion, AskSuggestion } from './thread';

export interface JobSchedule {
  is_active: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: string;
  time?: string;
  next_run_at?: string;
  last_run_at?: string;
  last_run_summary?: string;
}

export interface LinkedContext {
  source_job_id?: string;
  parent_job_id?: string;
}

export interface Job {
  id: string;
  kind: JobKind;
  type: JobType;
  title: string;
  status: JobStatus;
  has_unread_results: boolean;
  createdAt: string;
  updatedAt: string;
  last_viewed_at: string | null;
  expires_at: string | null;
  archived_at: string | null;

  /** Recurring schedule */
  schedule: JobSchedule | null;
  /** Link to parent/source job */
  linked_context: LinkedContext | null;

  /** Evidence pane ID */
  evidenceId?: string;

  /** Human-readable "Scope → Outcome" subtitle */
  scopeOutput?: string;

  // ── Chat / conversation fields (absorbed from Thread) ──
  messages: Message[];
  decisionChips?: string[];
  scope?: Scope;
  scopeLabel?: string;
  nextSuggestions?: NextSuggestion[];
  askSuggestions?: AskSuggestion[];
  /** List of child job IDs spawned from this conversation */
  spawnedJobIds?: string[];

  // ── Job execution fields ──
  inputs?: {
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
  /** Progress simulation stages */
  progressStages?: string[];
  currentStage?: number;
}
