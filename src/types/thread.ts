import type { Attachment, Scope, ThreadType } from './common';

export interface Message {
  id: string;
  role: 'seller' | 'agent';
  timestamp: string;
  content: string;
  attachments?: Attachment[];
  /** Embedded card types */
  cardType?: 'JOB_PROPOSAL' | 'JOB_RESULT' | 'DECISION_CHIPS' | 'SIGNAL_FEEDBACK';
  cardData?: JobProposalCardData | JobResultCardData | SignalFeedbackCardData | string[];
}

export interface SignalFeedbackOption {
  id: string;
  label: string;
  description: string;
  scope: 'all' | 'category' | 'account' | 'specific';
  icon: 'globe' | 'tag' | 'building' | 'bell-off' | 'bell' | 'star';
}

export interface SignalFeedbackCardData {
  sentiment: 'thumbs_up' | 'thumbs_down';
  signalCardId: string;
  signalCategory: string;
  signalTitle: string;
  accountId?: string;
  accountName?: string;
  options: SignalFeedbackOption[];
}

export interface JobProposalCardData {
  jobName: string;
  jobType: string;
  inputsSummary: string[];
  outputsExpected: string[];
  approvalsNeeded: boolean;
  jobInputs?: Record<string, unknown>;
}

export interface JobResultCardData {
  jobId: string;
  jobTitle: string;
  completedTime: string;
  highlights: string[];
}

/** A key action event in a thread's activity timeline */
export interface KeyAction {
  id: string;
  type: 'preference' | 'evidence_view' | 'job_started' | 'job_completed' | 'job_needs_review' | 'job_blocked';
  /** Verb-first primary text */
  title: string;
  /** Muted secondary: timestamp + scope */
  subtitle: string;
  /** Deep link label (e.g. "Open job", "View results", "Review") */
  linkLabel?: string;
  /** Job ID for deep-linking */
  jobId?: string;
  /** Evidence ID for deep-linking */
  evidenceId?: string;
}

/** A contextual next-best-action suggestion */
export interface NextSuggestion {
  id: string;
  title: string;
  why: string;
  cta: string;          // "Run" | "Open" | "Configure"
  /** If set, sends this as a message on click */
  prompt?: string;
}

/** A contextual follow-up question suggestion */
export interface AskSuggestion {
  id: string;
  question: string;
  why: string;
}

export interface Thread {
  id: string;
  title: string;
  type: ThreadType;
  pinned: boolean;
  archived?: boolean;
  /** Optional custom section id (overrides time-based bucketing) */
  section?: string;
  scope: Scope;
  createdAt: string;
  updatedAt: string;
  decisionChips: string[];
  spawnedJobIds: string[];
  messages: Message[];
  miniOutcome?: string;
  /** Two-part progress: "{last outcome} • {next step}" */
  progressLine?: string;
  /** Thread activity timeline */
  keyActions?: KeyAction[];
  /** Contextual "Next" suggestions */
  nextSuggestions?: NextSuggestion[];
  /** Contextual "Ask" follow-up questions */
  askSuggestions?: AskSuggestion[];
  /** Short label for tile scope chip (e.g. "West SMB book", "Acme opp") */
  scopeLabel?: string;
  /** Whether this thread has something requiring user attention */
  needsReview?: boolean;
}
