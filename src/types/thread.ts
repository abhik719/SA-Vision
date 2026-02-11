import type { Attachment } from './common';

export interface Message {
  id: string;
  role: 'seller' | 'agent';
  timestamp: string;
  content: string;
  attachments?: Attachment[];
  /** Embedded card types */
  cardType?: 'JOB_PROPOSAL' | 'JOB_RESULT' | 'DECISION_CHIPS' | 'SIGNAL_FEEDBACK';
  cardData?: JobProposalCardData | JobResultCardData | SignalFeedbackCardData | string[];
  /** Suggested reply chips (rendered as pill buttons under agent messages) */
  suggestedChips?: string[];
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

/** A contextual next-best-action suggestion */
export interface NextSuggestion {
  id: string;
  title: string;
  why: string;
  cta: string;
  /** If set, sends this as a message on click */
  prompt?: string;
}

/** A contextual follow-up question suggestion */
export interface AskSuggestion {
  id: string;
  question: string;
  why: string;
}
