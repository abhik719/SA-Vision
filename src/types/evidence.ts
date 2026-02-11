import type { DraftStatus, EvidenceType } from './common';
import type { OutreachPlan, OutreachDraft, LeadExecutionState, ExecutionEvent } from './outreach';

export interface EvidenceColumn {
  key: string;
  label: string;
}

export interface AccountRow {
  id: string;
  name: string;
  score: number;
  intent: string;
  change: string;
  why: string[];
}

export interface DiffChange {
  type: string;
  detail: string;
}

export interface AccountDiff {
  accountId: string;
  accountName: string;
  changes: DiffChange[];
}

export interface LeadRow {
  id: string;
  name: string;
  title: string;
  company: string;
  seniority: string;
  signals: string[];
  matchScore: number;
}

export interface ApprovalItem {
  draftId: string;
  leadId: string;
  leadName: string;
  accountName: string;
  status: DraftStatus;
  signals: string[];
  message: string;
}

// AGENT_HOME types
export interface AgentHomeChip {
  id: string;
  label: string;
  seedPrompt: string;
  threadTemplateId?: string;
}

// Signal Card types
export type SignalActionType = 'FIND_PEOPLE' | 'CREATE_OUTREACH' | 'INTERNAL_ACTION';

export interface SignalCtaAction {
  label: string;
  actionType: SignalActionType;
  nextView?: string;
  payload?: Record<string, unknown>;
}

export interface SignalEntity {
  type: 'account' | 'lead';
  id: string;
  name: string;
  logoUrl?: string;
}

export interface SignalTarget {
  type: 'lead';
  id: string;
  name: string;
  title: string;
  degree?: string;
  avatarUrl?: string;
}

export interface SignalEvidenceItem {
  label: string;
  value: string;
}

export interface SignalCardPreview {
  evidence: SignalEvidenceItem[];
  targets?: SignalTarget[];
  recommendation?: string;
}

export interface SignalCard {
  id: string;
  category: string;
  title: string;
  whyNow: string;
  meta: { entities: number; leads?: number; updated: string; confidence: string };
  entities: SignalEntity[];
  primaryCta: SignalCtaAction;
  secondaryCta: SignalCtaAction;
  tertiaryCta?: SignalCtaAction;
  preview: SignalCardPreview;
}

/** Lightweight person/account reference with optional image */
export interface PileItem {
  name: string;
  imageUrl?: string;
}

// Job Tile types (Needs attention section)
export type JobTileStatus = 'Needs review' | 'Ready' | 'Running' | 'Blocked';

export interface JobTilePreview {
  type: 'facepile' | 'logopile';
  items: PileItem[];
  overflowCount?: number;
}

export interface JobTileCta {
  label: string;
  targetState: 'APPROVALS' | 'RESULTS' | 'PROGRESS' | 'CONFIG' | 'DRAFT_REVIEW' | 'EXECUTION';
}

export interface JobTile {
  id: string;
  jobId: string;
  title: string;
  jobTypeLabel: string;
  scopeLabel?: string;
  updated: string;
  status: JobTileStatus;
  eta?: string;
  preview?: JobTilePreview;
  primaryCta: JobTileCta;
}

/** NEEDS_ATTENTION view types */
export interface NeedsAttentionItem {
  id: string;
  label: string;
  description: string;
  actionLabel: string;
  actionType: 'CONNECT_CRM' | 'PICK_SCOPE' | 'USE_SAVED' | 'RETRY' | 'CUSTOM';
}

/** CONFIGURATION view types */
export interface ConfigField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'multi-select' | 'number';
  value: string;
  options?: string[];
  placeholder?: string;
}

export interface Evidence {
  id: string;
  type: EvidenceType;
  title: string;
  subtitle?: string;
  context?: { threadId?: string; jobId?: string };
  generatedAt: string;
  // AGENT_HOME
  inputPlaceholders?: string[];
  chips?: AgentHomeChip[];
  signalCards?: SignalCard[];
  jobTiles?: JobTile[];
  // ACCOUNTS_RANKED_TABLE / LEADS_TABLE
  columns?: EvidenceColumn[];
  rows?: AccountRow[] | LeadRow[];
  // ACCOUNTS_DIFF_VIEW
  diffs?: AccountDiff[];
  // APPROVAL_QUEUE
  items?: ApprovalItem[];
  // JOB_RUNNING
  stages?: string[];
  currentStage?: number;
  log?: { time: string; message: string }[];
  // JOB_RESULTS
  summary?: Record<string, number | string>;
  nextActions?: { label: string; action: string }[];
  // SIGNAL_DETAIL
  signalCard?: SignalCard;
  // NEEDS_ATTENTION
  attentionItems?: NeedsAttentionItem[];
  attentionReason?: string;
  // CONFIGURATION
  configFields?: ConfigField[];
  previewLabel?: string;
  // OUTREACH_PLAN_BUILDER
  outreachPlan?: OutreachPlan;
  leadListId?: string;
  leadCount?: number;
  // OUTREACH_DRAFT_REVIEW
  outreachDrafts?: OutreachDraft[];
  // EXECUTION_MONITOR
  executionByLead?: LeadExecutionState[];
  executionEvents?: ExecutionEvent[];
  executionSummary?: { total: number; sent: number; waiting: number; replied: number };
}
