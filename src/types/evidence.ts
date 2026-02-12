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
export type JobTileStatus = 'New' | 'Queued' | 'Scheduled' | 'Input required' | 'Running' | 'Ready for review' | 'Archived';

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
  // SCHEDULE_AND_RUN
  draftCount?: number;
  // EXECUTION_MONITOR
  executionByLead?: LeadExecutionState[];
  executionEvents?: ExecutionEvent[];
  executionSummary?: { total: number; sent: number; waiting: number; replied: number };
  // REASONING_ANIMATION
  reasoningSteps?: ReasoningStep[];
  reasoningAutoAdvanceEvidenceId?: string;
  // ACCOUNTS_PRIORITIZED
  filterChips?: FilterChip[];
  accountsPrioritized?: PrioritizedAccountRow[];
  findLeadsLabel?: string;
  outreachLabel?: string;
  /** Total accounts in the seller's book / territory (for breadcrumb context) */
  bookSize?: number;
  /** Filters pre-applied by the engine (syncs to breadcrumb filterStack) */
  appliedFilters?: string[];
  /** Dynamic extra columns added by play refinements */
  extraColumns?: ExtraColumn[];
  // LEADS_DISCOVERY
  leadsDiscovery?: DiscoveryLeadRow[];
  totalLeadsCount?: number;
  quickResponses?: string[];
  agentOpeningMessage?: string;
}

// ── REASONING_ANIMATION types ──
export interface ReasoningStep {
  label: string;
  duration: number;
  icon: 'search' | 'zap' | 'target' | 'users' | 'brain' | 'chart';
}

// ── ACCOUNTS_PRIORITIZED types ──
export interface FilterChip {
  id: string;
  label: string;
  count: number;
}

export interface PrioritizedAccountRow {
  id: string;
  company: string;
  score: number;
  primarySignal: string;
  signalType: 'leadership' | 'funding' | 'engagement' | 'tech_fit' | 'expansion';
  actionItems: string[];
  employees: string;
  industry: string;
  location: string;
  filterTags: string[];
  /** Dynamic extra data keyed by column id */
  extraData?: Record<string, string>;
}

export interface ExtraColumn {
  id: string;
  label: string;
  width?: string;
}

// ── LEADS_DISCOVERY types ──
export interface DiscoveryLeadRow {
  id: string;
  name: string;
  title: string;
  company: string;
  signal: string;
  signalType: 'job_change' | 'engagement' | 'intent' | 'tech_stack';
  rationale: string;
  score: number;
  signals?: string[];
  email?: string;
  linkedin?: string;
  filterTags: string[];
}
