export type OutreachChannel = 'CONNECT_REQUEST' | 'INMAIL' | 'LINKEDIN_MESSAGE' | 'EMAIL' | 'EMAIL_FOLLOWUP' | 'NURTURE';
export type StepCondition = 'IF_CONNECT_ACCEPTED' | 'IF_NOT_ACCEPTED' | 'IF_NO_REPLY' | 'IF_REPLY' | 'ALWAYS' | null;

export interface OutreachStep {
  id: string;
  channel: OutreachChannel;
  dayOffset: number;
  condition: StepCondition;
  requiresApproval: boolean;
  addToCadence?: boolean;
  /** Parent step ID for branching — null means root step */
  parentStepId?: string | null;
  /** Optional custom label (e.g., "Follow-up email", "Final follow-up") */
  label?: string;
}

export interface OutreachGuardrails {
  approvalRequired: boolean;
  maxSendsPerDay: number;
  businessHoursOnly: boolean;
  stopOnReply: boolean;
}

export interface OutreachPlan {
  steps: OutreachStep[];
  guardrails: OutreachGuardrails;
  templateId?: string; // 'warm-connect' | 'inmail-first' | 'email-cadence'
}

export interface OutreachLead {
  id: string;
  fullName: string;
  title: string;
  company: { id: string; name: string; logoUrl?: string };
  location: string;
  connectionDegree: string;
  reasonForNow: string[];
  signals: string[];
  email: string;
  warmPath: { type: string; name: string; degree: string } | null;
}

export interface LeadList {
  id: string;
  name: string;
  sourceJobId: string;
  leadIds: string[];
}

export interface OutreachDraft {
  id: string;
  leadId: string;
  stepId: string;
  status: 'NEEDS_REVIEW' | 'APPROVED' | 'REJECTED' | 'EDITED';
  subject: string | null;
  body: string;
  lastEditedAt: string | null;
}

export type ExecStatus = 'QUEUED' | 'SENT' | 'WAITING_CONDITION' | 'NEEDS_INPUT' | 'STOPPED_REPLY' | 'COMPLETED';

export interface LeadExecutionState {
  leadId: string;
  currentStepId: string;
  status: ExecStatus;
  nextActionAt: string | null;
}

export interface ExecutionEvent {
  id: string;
  leadId: string;
  stepId: string;
  type: 'SENT' | 'CONNECT_ACCEPTED' | 'REPLY_RECEIVED' | 'NO_REPLY' | 'FOLLOW_UP_NEEDED';
  timestamp: string;
  message: string;
}
