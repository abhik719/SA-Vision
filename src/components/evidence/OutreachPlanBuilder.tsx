import { useState } from 'react';
import { useOutreachStore } from '../../store/useOutreachStore';
import { useJobStore } from '../../store/useJobStore';
import { useEvidenceStore } from '../../store/useEvidenceStore';
import { useAppStore } from '../../store/useAppStore';
import { useThreadStore } from '../../store/useThreadStore';
import type { Evidence } from '../../types/evidence';
import type { OutreachPlan, OutreachStep, OutreachChannel } from '../../types/outreach';
import {
  Linkedin,
  Mail,
  MessageSquare,
  UserPlus,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Shield,
  Users,
  Clock,
  Send,
  Save,
  ChevronRight,
} from 'lucide-react';

interface Props {
  evidence: Evidence;
}

const CHANNEL_CONFIG: Record<OutreachChannel, { label: string; icon: typeof Linkedin; color: string }> = {
  CONNECT_REQUEST: { label: 'Connection request', icon: UserPlus, color: 'bg-blue-100 text-blue-700' },
  INMAIL: { label: 'InMail', icon: Linkedin, color: 'bg-indigo-100 text-indigo-700' },
  LINKEDIN_MESSAGE: { label: 'LinkedIn message', icon: MessageSquare, color: 'bg-sky-100 text-sky-700' },
  EMAIL: { label: 'Email', icon: Mail, color: 'bg-amber-100 text-amber-700' },
};

const CONDITION_LABELS: Record<string, string> = {
  IF_CONNECT_ACCEPTED: 'If connect accepted',
  IF_NO_REPLY: 'If no reply',
};

const TEMPLATES = [
  { id: 'warm-connect', label: 'Warm connect-first', description: 'Connect → LI message → Email', steps: ['CONNECT_REQUEST', 'LINKEDIN_MESSAGE', 'EMAIL'] },
  { id: 'inmail-first', label: 'InMail-first', description: 'InMail → Email follow-up', steps: ['INMAIL', 'EMAIL'] },
  { id: 'email-cadence', label: 'Email-first (cadence)', description: 'Email → LI connect → InMail', steps: ['EMAIL', 'CONNECT_REQUEST', 'INMAIL'] },
] as const;

export default function OutreachPlanBuilder({ evidence }: Props) {
  const jobId = evidence.context?.jobId || 'job_outreach_01';
  const plan = useOutreachStore((s) => s.outreachPlansById[jobId]) || evidence.outreachPlan;
  const leads = useOutreachStore((s) => s.getLeadsForList(evidence.leadListId || ''));
  const setPlan = useOutreachStore((s) => s.setPlan);
  const reorderStep = useOutreachStore((s) => s.reorderStep);
  const removeStep = useOutreachStore((s) => s.removeStep);
  const addStep = useOutreachStore((s) => s.addStep);
  const setJobStatus = useJobStore((s) => s.setJobStatus);
  const setCurrentEvidence = useAppStore((s) => s.setCurrentEvidence);
  const addMessage = useThreadStore((s) => s.addMessage);
  const updateEvidence = useEvidenceStore((s) => s.updateEvidence);

  const [selectedTemplate, setSelectedTemplate] = useState(plan?.templateId || 'warm-connect');
  const [showLeads, setShowLeads] = useState(false);
  const [guardrails, setGuardrails] = useState(
    plan?.guardrails || { approvalRequired: true, maxSendsPerDay: 20, businessHoursOnly: true, stopOnReply: true }
  );

  const steps = plan?.steps || [];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const tpl = TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    const newSteps: OutreachStep[] = tpl.steps.map((channel, i) => ({
      id: `step_${String(i + 1).padStart(2, '0')}`,
      channel: channel as OutreachChannel,
      dayOffset: i,
      condition: i === 0 ? null : (channel === 'LINKEDIN_MESSAGE' ? 'IF_CONNECT_ACCEPTED' : 'IF_NO_REPLY'),
      requiresApproval: true,
      addToCadence: channel === 'EMAIL',
    }));
    const newPlan: OutreachPlan = { steps: newSteps, guardrails, templateId };
    setPlan(jobId, newPlan);
  };

  const handleAddStep = () => {
    const nextId = `step_${String(steps.length + 1).padStart(2, '0')}`;
    addStep(jobId, {
      id: nextId,
      channel: 'EMAIL',
      dayOffset: steps.length > 0 ? steps[steps.length - 1].dayOffset + 2 : 0,
      condition: 'IF_NO_REPLY',
      requiresApproval: true,
    });
  };

  const handleGenerateDrafts = () => {
    // 1. Update job status
    setJobStatus(jobId, 'DRAFTING');
    setTimeout(() => setJobStatus(jobId, 'NEEDS_INPUT'), 800);

    // 2. Update plan guardrails
    if (plan) {
      setPlan(jobId, { ...plan, guardrails });
    }

    // 3. Add system message to thread
    const threadId = evidence.context?.threadId;
    if (threadId) {
      addMessage(threadId, {
        id: `msg_gen_${Date.now()}`,
        role: 'agent',
        timestamp: new Date().toISOString(),
        content: `Generating drafts for ${evidence.leadCount || 8} leads across ${steps.length} steps. This will take a moment...`,
      });
      setTimeout(() => {
        addMessage(threadId, {
          id: `msg_gen_done_${Date.now()}`,
          role: 'agent',
          timestamp: new Date().toISOString(),
          content: `Done! Generated drafts for all leads. Review and approve, then I'll schedule execution.`,
          attachments: [{ type: 'EVIDENCE_LINK', evidenceId: 'ev_outreach_drafts_01', label: 'Review drafts' }],
        });
      }, 1200);
    }

    // 4. Update evidence to mark drafts as ready
    updateEvidence('ev_outreach_drafts_01', {
      subtitle: `Connection requests, follow-up messages, and emails for ${evidence.leadCount || 8} leads.`,
    });

    // 5. Transition to draft review
    setTimeout(() => {
      setCurrentEvidence('ev_outreach_drafts_01');
    }, 1400);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto li-scrollbar">
      {/* Lead Set Summary */}
      <div className="border-b border-li-border-standard px-[24px] py-[16px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[8px]">
            <Users size={16} className="text-li-text-tertiary" />
            <span className="font-display text-[14px] font-semibold text-li-text-primary">
              {evidence.leadCount || 8} leads selected
            </span>
          </div>
          <button
            onClick={() => setShowLeads(!showLeads)}
            className="flex items-center gap-[4px] font-body text-[12px] text-li-blue hover:underline"
          >
            {showLeads ? 'Hide' : 'View selected leads'}
            <ChevronRight size={12} className={`transition-transform ${showLeads ? 'rotate-90' : ''}`} />
          </button>
        </div>
        {/* Filter chips */}
        <div className="mt-[8px] flex flex-wrap gap-[6px]">
          {['Finance', 'RevOps', 'CXO / VP+', 'West SMB'].map((chip) => (
            <span key={chip} className="inline-flex items-center rounded-ds-spotlight bg-li-bg-tertiary px-[8px] py-[2px] font-body text-ds-small text-li-text-tertiary">
              {chip}
            </span>
          ))}
        </div>
        {/* Expandable lead list */}
        {showLeads && (
          <div className="mt-[12px] space-y-[6px]">
            {leads.length > 0 ? leads.map((lead) => (
              <div key={lead.id} className="flex items-center gap-[8px] rounded-[6px] bg-li-bg-secondary px-[10px] py-[6px]">
                <div className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-li-blue/10 text-[11px] font-semibold text-li-blue">
                  {lead.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-body text-[12px] font-medium text-li-text-primary truncate">{lead.fullName}</div>
                  <div className="font-body text-[11px] text-li-text-tertiary truncate">{lead.title} · {lead.company.name}</div>
                </div>
                <span className="font-body text-[10px] text-li-text-disabled">{lead.connectionDegree}</span>
              </div>
            )) : (
              // Fallback if outreach store not seeded yet
              Array.from({ length: evidence.leadCount || 8 }, (_, i) => (
                <div key={i} className="flex items-center gap-[8px] rounded-[6px] bg-li-bg-secondary px-[10px] py-[6px]">
                  <div className="h-[28px] w-[28px] rounded-full bg-li-bg-tertiary" />
                  <div className="flex-1">
                    <div className="h-[12px] w-[120px] rounded bg-li-bg-tertiary" />
                    <div className="mt-[4px] h-[10px] w-[80px] rounded bg-li-bg-tertiary" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Template Selection */}
      <div className="border-b border-li-border-standard px-[24px] py-[16px]">
        <h4 className="font-display text-[13px] font-semibold text-li-text-primary mb-[10px]">Choose a template</h4>
        <div className="grid grid-cols-3 gap-[8px]">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handleTemplateSelect(tpl.id)}
              className={`rounded-[8px] border p-[10px] text-left transition-all ${
                selectedTemplate === tpl.id
                  ? 'border-li-blue bg-blue-50/50 ring-1 ring-li-blue/30'
                  : 'border-li-border-standard hover:border-li-blue/40 hover:bg-li-bg-secondary'
              }`}
            >
              <div className="font-body text-[12px] font-semibold text-li-text-primary">{tpl.label}</div>
              <div className="mt-[2px] font-body text-[11px] text-li-text-tertiary">{tpl.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Sequence Canvas */}
      <div className="border-b border-li-border-standard px-[24px] py-[16px]">
        <h4 className="font-display text-[13px] font-semibold text-li-text-primary mb-[10px]">Sequence steps</h4>
        <div className="space-y-[8px]">
          {steps.map((step, idx) => {
            const config = CHANNEL_CONFIG[step.channel];
            const Icon = config.icon;
            return (
              <div
                key={step.id}
                className="group flex items-center gap-[8px] rounded-[8px] border border-li-border-standard bg-white p-[10px] transition-colors hover:border-li-blue/30"
              >
                {/* Step number */}
                <div className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-li-bg-tertiary font-body text-[11px] font-semibold text-li-text-secondary">
                  {idx + 1}
                </div>
                {/* Channel pill */}
                <span className={`inline-flex items-center gap-[4px] rounded-[6px] px-[8px] py-[3px] font-body text-[11px] font-medium ${config.color}`}>
                  <Icon size={12} />
                  {config.label}
                </span>
                {/* Delay */}
                <span className="font-body text-[11px] text-li-text-tertiary">
                  Day {step.dayOffset}
                </span>
                {/* Condition */}
                {step.condition && (
                  <span className="rounded-[4px] bg-li-bg-secondary px-[6px] py-[2px] font-body text-[10px] text-li-text-tertiary">
                    {CONDITION_LABELS[step.condition] || step.condition}
                  </span>
                )}
                {step.addToCadence && (
                  <span className="rounded-[4px] bg-amber-50 px-[6px] py-[2px] font-body text-[10px] text-amber-700">
                    + cadence
                  </span>
                )}
                {/* Spacer */}
                <div className="flex-1" />
                {/* Controls */}
                <div className="flex items-center gap-[2px] opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => reorderStep(jobId, step.id, 'up')}
                    disabled={idx === 0}
                    className="rounded p-[3px] text-li-text-disabled hover:bg-li-bg-hover hover:text-li-text-secondary disabled:opacity-30"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => reorderStep(jobId, step.id, 'down')}
                    disabled={idx === steps.length - 1}
                    className="rounded p-[3px] text-li-text-disabled hover:bg-li-bg-hover hover:text-li-text-secondary disabled:opacity-30"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button
                    onClick={() => removeStep(jobId, step.id)}
                    className="rounded p-[3px] text-li-text-disabled hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          {/* Add step */}
          <button
            onClick={handleAddStep}
            className="flex w-full items-center justify-center gap-[6px] rounded-[8px] border border-dashed border-li-border-standard py-[8px] font-body text-[12px] text-li-text-tertiary transition-colors hover:border-li-blue hover:bg-blue-50/30 hover:text-li-blue"
          >
            <Plus size={14} />
            Add step
          </button>
        </div>
      </div>

      {/* Guardrails */}
      <div className="border-b border-li-border-standard px-[24px] py-[16px]">
        <div className="flex items-center gap-[6px] mb-[10px]">
          <Shield size={14} className="text-li-text-tertiary" />
          <h4 className="font-display text-[13px] font-semibold text-li-text-primary">Guardrails</h4>
        </div>
        <div className="space-y-[8px]">
          {[
            { key: 'approvalRequired', label: 'Approval required before send', icon: Shield },
            { key: 'businessHoursOnly', label: 'Business hours only', icon: Clock },
            { key: 'stopOnReply', label: 'Stop sequence on reply', icon: MessageSquare },
          ].map(({ key, label, icon: GIcon }) => (
            <label key={key} className="flex cursor-pointer items-center justify-between rounded-[6px] px-[8px] py-[6px] transition-colors hover:bg-li-bg-secondary">
              <div className="flex items-center gap-[8px]">
                <GIcon size={14} className="text-li-text-tertiary" />
                <span className="font-body text-[12px] text-li-text-secondary">{label}</span>
              </div>
              <div
                onClick={() => setGuardrails({ ...guardrails, [key]: !guardrails[key as keyof typeof guardrails] })}
                className={`relative h-[20px] w-[36px] rounded-full transition-colors ${
                  guardrails[key as keyof typeof guardrails] ? 'bg-li-blue' : 'bg-li-bg-tertiary'
                }`}
              >
                <div
                  className={`absolute top-[2px] h-[16px] w-[16px] rounded-full bg-white shadow transition-transform ${
                    guardrails[key as keyof typeof guardrails] ? 'translate-x-[18px]' : 'translate-x-[2px]'
                  }`}
                />
              </div>
            </label>
          ))}
          {/* Max sends/day */}
          <div className="flex items-center justify-between rounded-[6px] px-[8px] py-[6px]">
            <div className="flex items-center gap-[8px]">
              <Send size={14} className="text-li-text-tertiary" />
              <span className="font-body text-[12px] text-li-text-secondary">Max sends/day</span>
            </div>
            <input
              type="number"
              value={guardrails.maxSendsPerDay}
              onChange={(e) => setGuardrails({ ...guardrails, maxSendsPerDay: parseInt(e.target.value) || 20 })}
              className="w-[60px] rounded-[6px] border border-li-border-standard px-[8px] py-[4px] text-center font-body text-[12px] text-li-text-primary"
            />
          </div>
        </div>
      </div>

      {/* CTA Row */}
      <div className="sticky bottom-0 flex items-center justify-end gap-[8px] border-t border-li-border-standard bg-white px-[24px] py-[12px]">
        <button className="flex items-center gap-[6px] rounded-[8px] border border-li-border-standard px-[16px] py-[8px] font-body text-[13px] font-medium text-li-text-secondary transition-colors hover:bg-li-bg-secondary">
          <Save size={14} />
          Save plan
        </button>
        <button
          onClick={handleGenerateDrafts}
          className="flex items-center gap-[6px] rounded-[8px] bg-li-blue px-[16px] py-[8px] font-body text-[13px] font-medium text-white transition-colors hover:bg-li-blue-dark"
        >
          <Send size={14} />
          Generate drafts
        </button>
      </div>
    </div>
  );
}
