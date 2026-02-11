import { useState, useMemo, useCallback } from 'react';
import { useOutreachStore } from '../../store/useOutreachStore';
import { useJobStore } from '../../store/useJobStore';
import { useEvidenceStore } from '../../store/useEvidenceStore';
import { useAppStore } from '../../store/useAppStore';
import type { Evidence } from '../../types/evidence';
import type { OutreachStep, OutreachChannel, StepCondition } from '../../types/outreach';
import {
  Linkedin,
  Mail,
  MailCheck,
  MessageSquare,
  UserPlus,
  Trash2,
  Plus,
  Shield,
  Users,
  Clock,
  Send,
  Save,
  ChevronRight,
  GitBranch,
  Heart,
  ChevronDown,
} from 'lucide-react';

interface Props {
  evidence: Evidence;
}

const CHANNEL_CONFIG: Record<OutreachChannel, { label: string; icon: typeof Linkedin; color: string; bg: string }> = {
  CONNECT_REQUEST: { label: 'Connection request', icon: UserPlus, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  INMAIL: { label: 'InMail', icon: Linkedin, color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  LINKEDIN_MESSAGE: { label: 'LinkedIn message', icon: MessageSquare, color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' },
  EMAIL: { label: 'Email', icon: Mail, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  EMAIL_FOLLOWUP: { label: 'Email follow-up', icon: MailCheck, color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  NURTURE: { label: 'Nurture list', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
};

const CONDITION_CONFIG: Record<string, { label: string; color: string }> = {
  IF_CONNECT_ACCEPTED: { label: 'If accepted', color: 'text-green-700 bg-green-50 border-green-200' },
  IF_NOT_ACCEPTED: { label: 'If not accepted', color: 'text-orange-700 bg-orange-50 border-orange-200' },
  IF_NO_REPLY: { label: 'If no reply', color: 'text-slate-600 bg-slate-50 border-slate-200' },
  IF_REPLY: { label: 'If reply', color: 'text-green-700 bg-green-50 border-green-200' },
  ALWAYS: { label: 'Always', color: 'text-li-text-tertiary bg-li-bg-tertiary border-li-border-standard' },
};

const CHANNEL_OPTIONS: { value: OutreachChannel; label: string }[] = [
  { value: 'CONNECT_REQUEST', label: 'Connection request' },
  { value: 'LINKEDIN_MESSAGE', label: 'LinkedIn message' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'EMAIL_FOLLOWUP', label: 'Email follow-up' },
  { value: 'INMAIL', label: 'InMail' },
  { value: 'NURTURE', label: 'Add to nurture list' },
];

const CONDITION_OPTIONS: { value: StepCondition; label: string }[] = [
  { value: 'IF_CONNECT_ACCEPTED', label: 'If connect accepted' },
  { value: 'IF_NOT_ACCEPTED', label: 'If not accepted' },
  { value: 'IF_NO_REPLY', label: 'If no reply' },
  { value: 'IF_REPLY', label: 'If reply received' },
  { value: 'ALWAYS', label: 'Always (next step)' },
];

// ── Tree node type for rendering ──

interface TreeNode {
  step: OutreachStep;
  children: TreeNode[];
  depth: number;
  isBranch: boolean; // true if this is one of multiple children of same parent
  isLastChild: boolean;
}

function buildTree(steps: OutreachStep[]): TreeNode[] {
  const byParent: Record<string, OutreachStep[]> = {};
  const roots: OutreachStep[] = [];

  for (const step of steps) {
    const pid = step.parentStepId;
    if (!pid) {
      roots.push(step);
    } else {
      if (!byParent[pid]) byParent[pid] = [];
      byParent[pid].push(step);
    }
  }

  function recurse(step: OutreachStep, depth: number, isBranch: boolean, isLastChild: boolean): TreeNode {
    const children = (byParent[step.id] || []).map((child, i, arr) => {
      return recurse(child, depth + 1, arr.length > 1, i === arr.length - 1);
    });
    return { step, children, depth, isBranch, isLastChild };
  }

  return roots.map((r, i) => recurse(r, 0, false, i === roots.length - 1));
}

export default function OutreachPlanBuilder({ evidence }: Props) {
  const jobId = evidence.context?.jobId || 'job_outreach_01';
  const plan = useOutreachStore((s) => s.outreachPlansById[jobId]) || evidence.outreachPlan;
  const leadListsById = useOutreachStore((s) => s.leadListsById);
  const leadsById = useOutreachStore((s) => s.leadsById);
  const leads = useMemo(() => {
    const listId = evidence.leadListId || '';
    const list = leadListsById[listId];
    if (!list) return [];
    return list.leadIds.map((lid) => leadsById[lid]).filter(Boolean);
  }, [leadListsById, leadsById, evidence.leadListId]);
  const setPlan = useOutreachStore((s) => s.setPlan);
  const removeStep = useOutreachStore((s) => s.removeStep);
  const addStep = useOutreachStore((s) => s.addStep);
  const updateStep = useOutreachStore((s) => s.updateStep);
  const setJobStatus = useJobStore((s) => s.setJobStatus);
  const setCurrentEvidence = useAppStore((s) => s.setCurrentEvidence);
  const addMessage = useJobStore((s) => s.addMessage);
  const updateEvidence = useEvidenceStore((s) => s.updateEvidence);

  const [showLeads, setShowLeads] = useState(false);
  const [addingToStepId, setAddingToStepId] = useState<string | null>(null);
  const [newStepChannel, setNewStepChannel] = useState<OutreachChannel>('EMAIL');
  const [newStepCondition, setNewStepCondition] = useState<StepCondition>('IF_NO_REPLY');
  const [guardrails, setGuardrails] = useState(
    plan?.guardrails || { approvalRequired: true, maxSendsPerDay: 20, businessHoursOnly: true, stopOnReply: true }
  );

  const steps = plan?.steps || [];
  const tree = useMemo(() => buildTree(steps), [steps]);

  const handleAddStep = useCallback((parentStepId: string) => {
    const parentStep = steps.find(s => s.id === parentStepId);
    const nextId = `step_${String(steps.length + 1).padStart(2, '0')}_${Date.now().toString(36)}`;
    const dayOffset = parentStep ? parentStep.dayOffset + 2 : 0;
    addStep(jobId, {
      id: nextId,
      channel: newStepChannel,
      dayOffset,
      condition: newStepCondition,
      parentStepId,
      requiresApproval: newStepChannel !== 'NURTURE',
      label: CHANNEL_CONFIG[newStepChannel].label,
    });
    setAddingToStepId(null);
    setNewStepChannel('EMAIL');
    setNewStepCondition('IF_NO_REPLY');
  }, [steps, newStepChannel, newStepCondition, addStep, jobId]);

  const handleRemoveStep = useCallback((stepId: string) => {
    // Remove step and all its descendants
    const toRemove = new Set<string>();
    const collectDescendants = (id: string) => {
      toRemove.add(id);
      steps.filter(s => s.parentStepId === id).forEach(s => collectDescendants(s.id));
    };
    collectDescendants(stepId);
    // Remove one at a time from leaves up
    const ordered = [...toRemove].reverse();
    ordered.forEach(id => removeStep(jobId, id));
  }, [steps, removeStep, jobId]);

  const handleChangeChannel = useCallback((stepId: string, channel: OutreachChannel) => {
    updateStep(jobId, stepId, {
      channel,
      label: CHANNEL_CONFIG[channel].label,
      requiresApproval: channel !== 'NURTURE',
      addToCadence: channel === 'EMAIL' ? true : undefined,
    });
  }, [updateStep, jobId]);

  const handleChangeDayOffset = useCallback((stepId: string, dayOffset: number) => {
    updateStep(jobId, stepId, { dayOffset });
  }, [updateStep, jobId]);

  const handleGenerateDrafts = () => {
    setJobStatus(jobId, 'RUNNING');
    setTimeout(() => setJobStatus(jobId, 'NEEDS_INPUT'), 800);

    if (plan) {
      setPlan(jobId, { ...plan, guardrails });
    }

    const parentJobId = evidence.context?.jobId;
    if (parentJobId) {
      addMessage(parentJobId, {
        id: `msg_gen_${Date.now()}`,
        role: 'agent',
        timestamp: new Date().toISOString(),
        content: `Generating drafts for ${evidence.leadCount || 8} leads across ${steps.length} steps. This will take a moment...`,
      });
      setTimeout(() => {
        addMessage(parentJobId, {
          id: `msg_gen_done_${Date.now()}`,
          role: 'agent',
          timestamp: new Date().toISOString(),
          content: `Done! Generated drafts for all leads. Review and approve, then I'll schedule execution.`,
          attachments: [{ type: 'EVIDENCE_LINK', evidenceId: 'ev_outreach_drafts_01', label: 'Review drafts' }],
        });
      }, 1200);
    }

    updateEvidence('ev_outreach_drafts_01', {
      subtitle: `Messages for ${evidence.leadCount || 8} leads across ${steps.length} steps.`,
    });

    setTimeout(() => {
      setCurrentEvidence('ev_outreach_drafts_01');
    }, 1400);
  };

  // ── Render a tree node recursively ──
  const renderNode = (node: TreeNode): React.ReactNode => {
    const { step, children, depth } = node;
    const config = CHANNEL_CONFIG[step.channel];
    const Icon = config.icon;
    const condConfig = step.condition ? CONDITION_CONFIG[step.condition] || null : null;
    const isRoot = depth === 0;
    const hasBranches = children.length > 1;

    return (
      <div key={step.id} className="relative">
        {/* Connector line from parent */}
        {!isRoot && (
          <div className="flex items-stretch" style={{ paddingLeft: depth * 24 }}>
            <div className="flex flex-col items-center w-[24px] shrink-0">
              <div className="w-px flex-1 bg-li-border-standard" />
            </div>
            {/* Condition badge on the connector */}
            {condConfig && (
              <div className="flex items-center py-[4px]">
                <span className={`inline-flex items-center gap-[3px] rounded-[4px] border px-[6px] py-[1px] font-body text-[10px] font-medium ${condConfig.color}`}>
                  {condConfig.label}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Step card */}
        <div className="flex items-stretch" style={{ paddingLeft: depth * 24 }}>
          {/* Vertical connector rail */}
          {!isRoot && (
            <div className="flex flex-col items-center w-[24px] shrink-0">
              <div className="w-px h-[8px] bg-li-border-standard" />
              <div className="w-[8px] h-[8px] rounded-full border-2 border-li-border-standard bg-white shrink-0" />
              {children.length > 0 && (
                <div className="w-px flex-1 bg-li-border-standard" />
              )}
            </div>
          )}

          {/* Card */}
          <div className={`group flex-1 flex items-center gap-[8px] rounded-[8px] border ${config.bg} p-[10px] my-[2px] transition-all hover:shadow-sm`}>
            {/* Channel icon + pill */}
            <div className={`flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[6px] bg-white/80 ${config.color}`}>
              <Icon size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-[6px]">
                <span className={`font-body text-[12px] font-semibold ${config.color}`}>
                  {step.label || config.label}
                </span>
                {step.addToCadence && (
                  <span className="rounded-[3px] bg-white/60 px-[4px] py-[0.5px] font-body text-[9px] text-amber-700">
                    + cadence
                  </span>
                )}
              </div>
              <div className="flex items-center gap-[6px] mt-[1px]">
                <span className="font-body text-[10px] text-li-text-tertiary">
                  Day {step.dayOffset}
                </span>
                {step.requiresApproval && (
                  <span className="font-body text-[9px] text-li-text-disabled">• Approval req.</span>
                )}
              </div>
            </div>

            {/* Inline editors */}
            <div className="flex items-center gap-[4px] opacity-0 group-hover:opacity-100 transition-opacity">
              <select
                value={step.channel}
                onChange={(e) => handleChangeChannel(step.id, e.target.value as OutreachChannel)}
                className="rounded-[4px] border border-li-border-standard bg-white px-[4px] py-[2px] font-body text-[10px] text-li-text-secondary"
              >
                {CHANNEL_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <input
                type="number"
                value={step.dayOffset}
                onChange={(e) => handleChangeDayOffset(step.id, parseInt(e.target.value) || 0)}
                className="w-[40px] rounded-[4px] border border-li-border-standard bg-white px-[4px] py-[2px] text-center font-body text-[10px] text-li-text-secondary"
                title="Day offset"
              />
              {!isRoot && (
                <button
                  onClick={() => handleRemoveStep(step.id)}
                  className="rounded p-[3px] text-li-text-disabled hover:bg-red-50 hover:text-red-500"
                  title="Remove step and children"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>

            {/* Add child step */}
            <button
              onClick={() => setAddingToStepId(addingToStepId === step.id ? null : step.id)}
              className="rounded p-[3px] text-li-text-disabled hover:bg-li-bg-hover hover:text-li-blue transition-colors"
              title="Add step after this"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        {/* Add step popover */}
        {addingToStepId === step.id && (
          <div className="flex items-stretch" style={{ paddingLeft: (depth + (isRoot ? 0 : 1)) * 24 }}>
            {!isRoot && <div className="w-[24px] shrink-0" />}
            <div className="flex-1 ml-[36px] my-[4px] rounded-[8px] border border-li-blue/30 bg-blue-50/30 p-[10px]">
              <div className="font-body text-[11px] font-semibold text-li-text-secondary mb-[6px]">
                Add step after "{step.label || config.label}"
              </div>
              <div className="flex items-center gap-[6px] flex-wrap">
                <select
                  value={newStepCondition || ''}
                  onChange={(e) => setNewStepCondition(e.target.value as StepCondition)}
                  className="rounded-[6px] border border-li-border-standard bg-white px-[8px] py-[4px] font-body text-[11px]"
                >
                  {CONDITION_OPTIONS.map(o => (
                    <option key={o.value || 'null'} value={o.value || ''}>{o.label}</option>
                  ))}
                </select>
                <span className="font-body text-[10px] text-li-text-disabled">→</span>
                <select
                  value={newStepChannel}
                  onChange={(e) => setNewStepChannel(e.target.value as OutreachChannel)}
                  className="rounded-[6px] border border-li-border-standard bg-white px-[8px] py-[4px] font-body text-[11px]"
                >
                  {CHANNEL_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleAddStep(step.id)}
                  className="flex items-center gap-[3px] rounded-[6px] bg-li-blue px-[10px] py-[4px] font-body text-[11px] font-medium text-white hover:bg-li-blue-dark"
                >
                  <Plus size={11} />
                  Add
                </button>
                <button
                  onClick={() => setAddingToStepId(null)}
                  className="rounded-[6px] px-[8px] py-[4px] font-body text-[11px] text-li-text-tertiary hover:bg-li-bg-hover"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Branch indicator if multiple children */}
        {hasBranches && (
          <div className="flex items-center gap-[6px] py-[2px]" style={{ paddingLeft: (depth + (isRoot ? 0 : 1)) * 24 + (isRoot ? 0 : 24) }}>
            <GitBranch size={11} className="text-li-text-disabled" />
            <span className="font-body text-[10px] text-li-text-disabled">
              {children.length} branches
            </span>
          </div>
        )}

        {/* Render children */}
        {children.map(child => renderNode(child))}
      </div>
    );
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
        <div className="mt-[8px] flex flex-wrap gap-[6px]">
          {['Finance', 'RevOps', 'CXO / VP+', 'West SMB'].map((chip) => (
            <span key={chip} className="inline-flex items-center rounded-ds-spotlight bg-li-bg-tertiary px-[8px] py-[2px] font-body text-ds-small text-li-text-tertiary">
              {chip}
            </span>
          ))}
        </div>
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

      {/* Sequence Flow Canvas */}
      <div className="border-b border-li-border-standard px-[24px] py-[16px]">
        <div className="flex items-center justify-between mb-[12px]">
          <div className="flex items-center gap-[6px]">
            <GitBranch size={14} className="text-li-text-tertiary" />
            <h4 className="font-display text-[13px] font-semibold text-li-text-primary">Outreach sequence</h4>
          </div>
          <div className="flex items-center gap-[4px]">
            <span className="font-body text-[11px] text-li-text-tertiary">
              {steps.length} steps · {steps.filter(s => !s.parentStepId).length === 0 ? 1 : steps.filter(s => !s.parentStepId).length} entry
            </span>
          </div>
        </div>

        {/* Tree canvas */}
        <div className="relative">
          {tree.length === 0 ? (
            <div className="rounded-[8px] border border-dashed border-li-border-standard p-[16px] text-center">
              <p className="font-body text-[12px] text-li-text-tertiary mb-[8px]">No steps yet. Add a starting action.</p>
              <button
                onClick={() => {
                  addStep(jobId, {
                    id: 'step_01',
                    channel: 'CONNECT_REQUEST',
                    dayOffset: 0,
                    condition: null,
                    parentStepId: null,
                    requiresApproval: true,
                    label: 'Connection request',
                  });
                }}
                className="flex items-center gap-[4px] mx-auto rounded-[6px] bg-li-blue px-[12px] py-[6px] font-body text-[12px] font-medium text-white hover:bg-li-blue-dark"
              >
                <Plus size={13} />
                Add connection request
              </button>
            </div>
          ) : (
            tree.map(node => renderNode(node))
          )}
        </div>

        {/* Hint */}
        <div className="mt-[10px] flex items-center gap-[4px]">
          <ChevronDown size={10} className="text-li-text-disabled" />
          <span className="font-body text-[10px] text-li-text-disabled">
            Hover any step to edit or add branches. You can also modify this sequence by chatting with the agent.
          </span>
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
