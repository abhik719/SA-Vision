import { useMemo } from 'react';
import {
  UserPlus,
  MessageSquare,
  Mail,
  Check,
  Clock,
  Send,
  Pause,
  // AlertCircle,
  MessageCircle,
  Minus,
} from 'lucide-react';
import clsx from 'clsx';
import { getLeadAvatar } from '../../data/leadAvatars';

// ── Types ────────────────────────────────────────────

type StepStatus = 'completed' | 'sent' | 'scheduled' | 'waiting' | 'replied' | 'skipped' | 'pending';

interface LeadStep {
  stepId: string;
  status: StepStatus;
  detail?: string; // e.g. "Sent 2h ago", "Opens: 1", "Accepted"
}

export interface LeadExecRow {
  leadId: string;
  name: string;
  title: string;
  company: string;
  avatarUrl?: string;
  steps: LeadStep[];
}

export interface OutreachStepDef {
  id: string;
  label: string;
  channel: string;
  icon: typeof Mail;
}

// ── Default steps for the play demo ──────────────────

const DEFAULT_STEPS: OutreachStepDef[] = [
  { id: 'step_connect', label: 'Connection request', channel: 'LinkedIn', icon: UserPlus },
  { id: 'step_li_msg', label: 'LinkedIn message', channel: 'LinkedIn', icon: MessageSquare },
  { id: 'step_email_1', label: 'Email 1', channel: 'Email', icon: Mail },
  { id: 'step_email_fu', label: 'Follow-up email', channel: 'Email', icon: Mail },
  { id: 'step_final', label: 'Final follow-up', channel: 'Email', icon: Mail },
];

// ── Status cell styling ──────────────────────────────

const STATUS_CONFIG: Record<StepStatus, { icon: typeof Check; label: string; cellClass: string; iconClass: string }> = {
  completed: { icon: Check, label: 'Completed', cellClass: 'bg-green-50/60', iconClass: 'text-green-600' },
  sent: { icon: Send, label: 'Sent', cellClass: 'bg-blue-50/60', iconClass: 'text-blue-600' },
  scheduled: { icon: Clock, label: 'Scheduled', cellClass: 'bg-li-bg-secondary', iconClass: 'text-li-text-tertiary' },
  waiting: { icon: Pause, label: 'Waiting', cellClass: 'bg-amber-50/60', iconClass: 'text-amber-600' },
  replied: { icon: MessageCircle, label: 'Replied', cellClass: 'bg-green-50/80', iconClass: 'text-green-700' },
  skipped: { icon: Minus, label: 'Skipped', cellClass: 'bg-transparent', iconClass: 'text-li-text-disabled' },
  pending: { icon: Clock, label: 'Pending', cellClass: 'bg-transparent', iconClass: 'text-li-text-disabled/40' },
};

// ── Seed data: 8 leads with realistic statuses ──────

const SEED_LEADS: LeadExecRow[] = [
  {
    leadId: 'lead_01', name: 'Marcus Rivera', title: 'CFO', company: 'Acme Software',
    steps: [
      { stepId: 'step_connect', status: 'completed', detail: 'Accepted' },
      { stepId: 'step_li_msg', status: 'sent', detail: 'Sent 4h ago' },
      { stepId: 'step_email_1', status: 'skipped', detail: 'Connected' },
      { stepId: 'step_email_fu', status: 'skipped' },
      { stepId: 'step_final', status: 'skipped' },
    ],
  },
  {
    leadId: 'lead_02', name: 'Emily Watson', title: 'VP Finance', company: 'Northwind Traders',
    steps: [
      { stepId: 'step_connect', status: 'sent', detail: 'Sent 6h ago' },
      { stepId: 'step_li_msg', status: 'pending' },
      { stepId: 'step_email_1', status: 'scheduled', detail: 'Tomorrow 9am' },
      { stepId: 'step_email_fu', status: 'pending' },
      { stepId: 'step_final', status: 'pending' },
    ],
  },
  {
    leadId: 'lead_03', name: 'Sarah Chen', title: 'VP Sales', company: 'Acme Software',
    steps: [
      { stepId: 'step_connect', status: 'completed', detail: 'Accepted' },
      { stepId: 'step_li_msg', status: 'completed', detail: 'Opened' },
      { stepId: 'step_email_1', status: 'skipped', detail: 'Connected' },
      { stepId: 'step_email_fu', status: 'skipped' },
      { stepId: 'step_final', status: 'skipped' },
    ],
  },
  {
    leadId: 'lead_04', name: 'James Park', title: 'Head of RevOps', company: 'Contoso Cloud',
    steps: [
      { stepId: 'step_connect', status: 'sent', detail: 'Sent 5h ago' },
      { stepId: 'step_li_msg', status: 'pending' },
      { stepId: 'step_email_1', status: 'scheduled', detail: 'Tomorrow 9am' },
      { stepId: 'step_email_fu', status: 'pending' },
      { stepId: 'step_final', status: 'pending' },
    ],
  },
  {
    leadId: 'lead_05', name: 'Priya Sharma', title: 'CFO', company: 'Fabrikam AI',
    steps: [
      { stepId: 'step_connect', status: 'completed', detail: 'Accepted' },
      { stepId: 'step_li_msg', status: 'sent', detail: 'Sent 3h ago' },
      { stepId: 'step_email_1', status: 'skipped', detail: 'Connected' },
      { stepId: 'step_email_fu', status: 'skipped' },
      { stepId: 'step_final', status: 'skipped' },
    ],
  },
  {
    leadId: 'lead_06', name: 'David Kim', title: 'VP Operations', company: 'Globex Corp',
    steps: [
      { stepId: 'step_connect', status: 'sent', detail: 'Sent 5h ago' },
      { stepId: 'step_li_msg', status: 'pending' },
      { stepId: 'step_email_1', status: 'scheduled', detail: 'Wed 9am' },
      { stepId: 'step_email_fu', status: 'pending' },
      { stepId: 'step_final', status: 'pending' },
    ],
  },
  {
    leadId: 'lead_07', name: 'Rachel Foster', title: 'Director of Sales', company: 'Initech Systems',
    steps: [
      { stepId: 'step_connect', status: 'completed', detail: 'Accepted' },
      { stepId: 'step_li_msg', status: 'replied', detail: 'Replied 1h ago' },
      { stepId: 'step_email_1', status: 'skipped', detail: 'Replied' },
      { stepId: 'step_email_fu', status: 'skipped' },
      { stepId: 'step_final', status: 'skipped' },
    ],
  },
  {
    leadId: 'lead_08', name: 'Tom Baker', title: 'CRO', company: 'Hooli Inc',
    steps: [
      { stepId: 'step_connect', status: 'sent', detail: 'Sent 4h ago' },
      { stepId: 'step_li_msg', status: 'pending' },
      { stepId: 'step_email_1', status: 'scheduled', detail: 'Tomorrow 2pm' },
      { stepId: 'step_email_fu', status: 'pending' },
      { stepId: 'step_final', status: 'pending' },
    ],
  },
];

// ── Component ────────────────────────────────────────

interface Props {
  leads?: LeadExecRow[];
  steps?: OutreachStepDef[];
}

export default function PlayExecutionStatus({ leads = SEED_LEADS, steps = DEFAULT_STEPS }: Props) {
  // Aggregate stats
  const stats = useMemo(() => {
    let connected = 0, sent = 0, replied = 0, scheduled = 0;
    for (const lead of leads) {
      for (const s of lead.steps) {
        if (s.status === 'completed') connected++;
        if (s.status === 'sent') sent++;
        if (s.status === 'replied') replied++;
        if (s.status === 'scheduled') scheduled++;
      }
    }
    return { connected, sent, replied, scheduled, total: leads.length };
  }, [leads]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Summary bar */}
      <div
        className="flex shrink-0 items-center gap-[16px] px-[20px] py-[10px]"
        style={{ borderBottom: '1px solid var(--border-standard)' }}
      >
        <span className="font-display text-[13px] font-semibold text-li-text-primary">
          Outreach status
        </span>
        <div className="flex items-center gap-[12px] font-body text-[11px] text-li-text-tertiary">
          <span>{stats.total} leads</span>
          <span className="flex items-center gap-[3px]">
            <span className="inline-block h-[6px] w-[6px] rounded-full bg-green-500" />
            {stats.connected} connected
          </span>
          <span className="flex items-center gap-[3px]">
            <span className="inline-block h-[6px] w-[6px] rounded-full bg-blue-500" />
            {stats.sent} sent
          </span>
          <span className="flex items-center gap-[3px]">
            <span className="inline-block h-[6px] w-[6px] rounded-full bg-green-700" />
            {stats.replied} replied
          </span>
          <span className="flex items-center gap-[3px]">
            <span className="inline-block h-[6px] w-[6px] rounded-full bg-gray-400" />
            {stats.scheduled} scheduled
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto li-scrollbar">
        <table className="min-w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-white">
            <tr style={{ borderBottom: '2px solid var(--border-standard)' }}>
              <th className="w-[220px] px-[16px] py-[8px] text-left font-body text-[11px] font-semibold uppercase tracking-wide text-li-text-tertiary">
                Lead
              </th>
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <th
                    key={step.id}
                    className="min-w-[120px] px-[10px] py-[8px] text-center font-body text-[10px] font-semibold uppercase tracking-wide text-li-text-tertiary"
                  >
                    <div className="flex flex-col items-center gap-[2px]">
                      <Icon size={12} className="text-li-text-disabled" />
                      <span>{step.label}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.leadId}
                className="transition-colors hover:bg-li-bg-hover"
                style={{ borderBottom: '1px solid var(--border-standard)' }}
              >
                {/* Lead cell */}
                <td className="px-[16px] py-[8px]">
                  <div className="flex items-center gap-[8px]">
                    {getLeadAvatar(lead.leadId) ? (
                      <img
                        src={getLeadAvatar(lead.leadId)!}
                        alt={lead.name}
                        className="h-[28px] w-[28px] shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-li-bg-tertiary text-[10px] font-semibold text-li-text-secondary">
                        {lead.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="truncate font-body text-[12px] font-semibold text-li-text-primary">
                        {lead.name}
                      </div>
                      <div className="truncate font-body text-[10px] text-li-text-tertiary">
                        {lead.title} · {lead.company}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Step cells */}
                {lead.steps.map((step) => {
                  const config = STATUS_CONFIG[step.status];
                  const Icon = config.icon;
                  return (
                    <td
                      key={step.stepId}
                      className={clsx('px-[10px] py-[8px] text-center', config.cellClass)}
                    >
                      <div className="flex flex-col items-center gap-[2px]">
                        <Icon size={13} className={config.iconClass} />
                        {step.detail && (
                          <span className="font-body text-[9px] text-li-text-tertiary">
                            {step.detail}
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
