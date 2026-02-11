import { useState, useMemo } from 'react';
import { useOutreachStore } from '../../store/useOutreachStore';
import { useJobStore } from '../../store/useJobStore';
import { useEvidenceStore } from '../../store/useEvidenceStore';
import { useAppStore } from '../../store/useAppStore';
import type { Evidence } from '../../types/evidence';
import type { OutreachDraft } from '../../types/outreach';
import {
  Check,
  CheckCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Mail,
  UserPlus,
  Linkedin,
  Shield,
  Calendar,
  X,
} from 'lucide-react';
import { getLeadAvatar } from '../../data/leadAvatars';

interface Props {
  evidence: Evidence;
}

const STEP_ICONS: Record<string, typeof Mail> = {
  step_01: UserPlus,
  step_02: MessageSquare,
  step_03: Mail,
};

const STEP_LABELS: Record<string, string> = {
  step_01: 'Connection request',
  step_02: 'LinkedIn message',
  step_03: 'Email',
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  NEEDS_REVIEW: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Needs review' },
  APPROVED: { bg: 'bg-green-50', text: 'text-green-700', label: 'Approved' },
  REJECTED: { bg: 'bg-red-50', text: 'text-red-700', label: 'Rejected' },
  EDITED: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Edited' },
};

export default function OutreachDraftReview({ evidence }: Props) {
  const jobId = evidence.context?.jobId || 'job_outreach_01';
  const draftsById = useOutreachStore((s) => s.draftsById);
  const allDrafts = useMemo(() => Object.values(draftsById), [draftsById]);
  const leadsById = useOutreachStore((s) => s.leadsById);
  const updateDraftStatus = useOutreachStore((s) => s.updateDraftStatus);
  const updateDraftBody = useOutreachStore((s) => s.updateDraftBody);
  const updateDraftSubject = useOutreachStore((s) => s.updateDraftSubject);
  const approveAllDrafts = useOutreachStore((s) => s.approveAllDrafts);
  const setJobStatus = useJobStore((s) => s.setJobStatus);
  const setCurrentEvidence = useAppStore((s) => s.setCurrentEvidence);
  const addMessage = useJobStore((s) => s.addMessage);
  const setJobEvidence = useJobStore((s) => s.setJobEvidence);
  const updateEvidence = useEvidenceStore((s) => s.updateEvidence);

  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [filterStep, setFilterStep] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState<string>('');
  const [editingSubject, setEditingSubject] = useState<string>('');

  // Use drafts from store (live), fallback to evidence
  const drafts = useMemo(() => {
    if (allDrafts.length > 0) return allDrafts;
    return (evidence.outreachDrafts || []) as OutreachDraft[];
  }, [allDrafts, evidence.outreachDrafts]);

  const filteredDrafts = useMemo(() => {
    if (!filterStep) return drafts;
    return drafts.filter((d) => d.stepId === filterStep);
  }, [drafts, filterStep]);

  const selectedDraft = drafts.find((d) => d.id === selectedDraftId) || filteredDrafts[0];
  const selectedLead = selectedDraft ? leadsById[selectedDraft.leadId] : null;

  const approvedCount = drafts.filter((d) => d.status === 'APPROVED').length;
  const allApproved = approvedCount === drafts.length && drafts.length > 0;

  // Step filter counts
  const stepCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    drafts.forEach((d) => {
      counts[d.stepId] = (counts[d.stepId] || 0) + 1;
    });
    return counts;
  }, [drafts]);

  const handleSelectDraft = (draft: OutreachDraft) => {
    setSelectedDraftId(draft.id);
    setEditingBody(draft.body);
    setEditingSubject(draft.subject || '');
  };

  const handleApprove = () => {
    if (!selectedDraft) return;
    // Save any edits first
    if (editingBody !== selectedDraft.body) {
      updateDraftBody(selectedDraft.id, editingBody);
    }
    if (editingSubject !== (selectedDraft.subject || '')) {
      updateDraftSubject(selectedDraft.id, editingSubject);
    }
    updateDraftStatus(selectedDraft.id, 'APPROVED');
    // Move to next unreviewed
    const nextDraft = filteredDrafts.find((d) => d.id !== selectedDraft.id && d.status === 'NEEDS_REVIEW');
    if (nextDraft) handleSelectDraft(nextDraft);
  };

  const handleReject = () => {
    if (!selectedDraft) return;
    updateDraftStatus(selectedDraft.id, 'REJECTED');
  };

  const handleRewrite = () => {
    if (!selectedDraft) return;
    // Simulate rewrite
    const rewrites = [
      'Tightened the messaging — shorter hook, clearer ask.',
      'Rewrote with a more direct tone and specific signal reference.',
      'Made it punchier — under 40 words with the signal hook front and center.',
    ];
    const newBody = selectedDraft.body.split('.').slice(0, 2).join('.') + '. Worth a quick chat?';
    updateDraftBody(selectedDraft.id, newBody);
    setEditingBody(newBody);

    const parentJobId = evidence.context?.jobId;
    if (parentJobId) {
      addMessage(parentJobId, {
        id: `msg_rewrite_${Date.now()}`,
        role: 'agent',
        timestamp: new Date().toISOString(),
        content: `${rewrites[Math.floor(Math.random() * rewrites.length)]} Updated the draft for **${selectedLead?.fullName || 'this lead'}**.`,
      });
    }
  };

  const handleQuickTransform = (type: 'shorter' | 'direct') => {
    if (!selectedDraft) return;
    let newBody = selectedDraft.body;
    if (type === 'shorter') {
      const firstSentence = newBody.split(/[.!?]/)[0];
      newBody = `${firstSentence}. Open to a quick chat?`;
    } else {
      newBody = newBody.replace(/Would love to|I'd love to|Happy to/gi, 'Can we');
      newBody = newBody.replace(/Open to a/gi, 'Let\'s do a');
    }
    updateDraftBody(selectedDraft.id, newBody);
    setEditingBody(newBody);
  };

  const handleApproveAll = () => {
    approveAllDrafts();
  };

  const handleSchedule = () => {
    setJobStatus(jobId, 'COMPLETED');
    setJobEvidence(jobId, 'ev_outreach_exec_01');

    updateEvidence('ev_outreach_exec_01', {
      executionSummary: { total: drafts.length, sent: 0, waiting: 0, replied: 0 },
    });

    const parentJobId = evidence.context?.jobId;
    if (parentJobId) {
      addMessage(parentJobId, {
        id: `msg_schedule_${Date.now()}`,
        role: 'agent',
        timestamp: new Date().toISOString(),
        content: `All ${drafts.length} drafts approved! Ready to schedule the outreach sequence. Confirm timing and I'll start sending.`,
        attachments: [{ type: 'EVIDENCE_LINK', evidenceId: 'ev_outreach_exec_01', label: 'Schedule & run' }],
      });
    }

    setTimeout(() => {
      setCurrentEvidence('ev_outreach_exec_01');
    }, 300);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-li-border-standard px-[16px] py-[10px]">
        <div className="flex items-center gap-[10px]">
          <h3 className="font-display text-[14px] font-semibold text-li-text-primary">
            Review drafts ({drafts.length})
          </h3>
          <span className="font-body text-[12px] text-li-text-tertiary">
            {approvedCount} approved
          </span>
        </div>
        <div className="flex items-center gap-[6px]">
          <button
            onClick={handleApproveAll}
            disabled={allApproved}
            className="flex items-center gap-[4px] rounded-[6px] bg-green-600 px-[12px] py-[6px] font-body text-[12px] font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-40"
          >
            <CheckCheck size={14} />
            Approve all
          </button>
        </div>
      </div>

      {/* Step filter chips */}
      <div className="flex items-center gap-[6px] border-b border-li-border-standard px-[16px] py-[8px]">
        <button
          onClick={() => setFilterStep(null)}
          className={`rounded-[6px] px-[8px] py-[3px] font-body text-[11px] transition-colors ${
            !filterStep ? 'bg-li-blue text-white' : 'bg-li-bg-tertiary text-li-text-tertiary hover:bg-li-bg-hover'
          }`}
        >
          All ({drafts.length})
        </button>
        {Object.entries(stepCounts).map(([stepId, count]) => {
          const StepIcon = STEP_ICONS[stepId] || Mail;
          return (
            <button
              key={stepId}
              onClick={() => setFilterStep(stepId === filterStep ? null : stepId)}
              className={`flex items-center gap-[4px] rounded-[6px] px-[8px] py-[3px] font-body text-[11px] transition-colors ${
                filterStep === stepId ? 'bg-li-blue text-white' : 'bg-li-bg-tertiary text-li-text-tertiary hover:bg-li-bg-hover'
              }`}
            >
              <StepIcon size={11} />
              {STEP_LABELS[stepId] || stepId} ({count})
            </button>
          );
        })}
      </div>

      {/* All approved → Schedule panel */}
      {allApproved && (
        <div className="border-b border-green-200 bg-green-50 px-[16px] py-[12px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[8px]">
              <CheckCheck size={16} className="text-green-600" />
              <div>
                <div className="font-body text-[13px] font-semibold text-green-800">
                  All drafts approved — ready to schedule
                </div>
                <div className="font-body text-[11px] text-green-600">
                  {drafts.length} drafts across {Object.keys(stepCounts).length} steps
                </div>
              </div>
            </div>
            <button
              onClick={handleSchedule}
              className="flex items-center gap-[6px] rounded-[8px] bg-li-blue px-[14px] py-[7px] font-body text-[12px] font-medium text-white transition-colors hover:bg-li-blue-dark"
            >
              <Calendar size={14} />
              Schedule outreach job
            </button>
          </div>
        </div>
      )}

      {/* Main split view */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — draft list */}
        <div className="w-[240px] shrink-0 overflow-y-auto border-r border-li-border-standard li-scrollbar">
          {filteredDrafts.map((draft) => {
            const lead = leadsById[draft.leadId];
            const isSelected = draft.id === (selectedDraft?.id);
            const status = STATUS_STYLES[draft.status];
            const StepIcon = STEP_ICONS[draft.stepId] || Mail;
            return (
              <div
                key={draft.id}
                onClick={() => handleSelectDraft(draft)}
                className={`cursor-pointer border-b border-li-border-standard px-[12px] py-[10px] transition-colors ${
                  isSelected ? 'bg-blue-50/50 border-l-[3px] border-l-li-blue' : 'hover:bg-li-bg-hover border-l-[3px] border-l-transparent'
                }`}
              >
                <div className="flex items-center gap-[6px]">
                  {getLeadAvatar(draft.leadId) ? (
                    <img
                      src={getLeadAvatar(draft.leadId)}
                      alt={lead?.fullName || draft.leadId}
                      className="h-[24px] w-[24px] shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-li-bg-tertiary text-[10px] font-semibold text-li-text-secondary">
                      {(lead?.fullName || draft.leadId).split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-body text-[12px] font-medium text-li-text-primary">
                      {lead?.fullName || draft.leadId}
                    </div>
                    <div className="flex items-center gap-[4px]">
                      <StepIcon size={10} className="text-li-text-disabled" />
                      <span className="truncate font-body text-[10px] text-li-text-tertiary">
                        {STEP_LABELS[draft.stepId] || draft.stepId}
                      </span>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-[4px] px-[4px] py-[1px] font-body text-[9px] font-medium ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right — draft editor */}
        <div className="flex flex-1 flex-col overflow-y-auto li-scrollbar">
          {selectedDraft ? (
            <>
              {/* Lead mini-card */}
              {selectedLead && (
                <div className="border-b border-li-border-standard px-[20px] py-[12px]">
                  <div className="flex items-center gap-[10px]">
                    {getLeadAvatar(selectedDraft.leadId) ? (
                      <img
                        src={getLeadAvatar(selectedDraft.leadId)}
                        alt={selectedLead.fullName}
                        className="h-[36px] w-[36px] rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-li-blue/10 text-[13px] font-semibold text-li-blue">
                        {selectedLead.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    <div>
                      <div className="font-body text-[13px] font-semibold text-li-text-primary">
                        {selectedLead.fullName}
                      </div>
                      <div className="font-body text-[11px] text-li-text-tertiary">
                        {selectedLead.title} · {selectedLead.company.name} · {selectedLead.connectionDegree}
                      </div>
                    </div>
                  </div>
                  {/* Warm path */}
                  {selectedLead.warmPath && (
                    <div className="mt-[6px] flex items-center gap-[4px]">
                      <Linkedin size={11} className="text-li-blue" />
                      <span className="font-body text-[11px] text-li-text-tertiary">
                        Mutual: <span className="text-li-text-secondary">{selectedLead.warmPath.name}</span> ({selectedLead.warmPath.degree})
                      </span>
                    </div>
                  )}
                  {/* Reason for now */}
                  <div className="mt-[8px] flex flex-wrap gap-[4px]">
                    {selectedLead.reasonForNow.map((r, i) => (
                      <span key={i} className="inline-flex items-center gap-[3px] rounded-[4px] bg-li-bg-secondary px-[6px] py-[2px] font-body text-[10px] text-li-text-tertiary">
                        <Sparkles size={9} className="text-amber-500" />
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Message editor */}
              <div className="flex-1 px-[20px] py-[12px]">
                <div className="flex items-center gap-[6px] mb-[8px]">
                  {(() => { const SI = STEP_ICONS[selectedDraft.stepId] || Mail; return <SI size={14} className="text-li-text-tertiary" />; })()}
                  <span className="font-body text-[12px] font-medium text-li-text-secondary">
                    {STEP_LABELS[selectedDraft.stepId] || selectedDraft.stepId}
                  </span>
                  <span className={`ml-auto rounded-[4px] px-[6px] py-[2px] font-body text-[10px] font-medium ${STATUS_STYLES[selectedDraft.status].bg} ${STATUS_STYLES[selectedDraft.status].text}`}>
                    {STATUS_STYLES[selectedDraft.status].label}
                  </span>
                </div>
                {/* Subject (for emails) */}
                {selectedDraft.subject !== null && (
                  <input
                    value={editingSubject}
                    onChange={(e) => setEditingSubject(e.target.value)}
                    onBlur={() => updateDraftSubject(selectedDraft.id, editingSubject)}
                    className="mb-[8px] w-full rounded-[6px] border border-li-border-standard px-[10px] py-[6px] font-body text-[12px] text-li-text-primary placeholder:text-li-text-disabled"
                    placeholder="Subject line..."
                  />
                )}
                {/* Body */}
                <textarea
                  value={editingBody}
                  onChange={(e) => setEditingBody(e.target.value)}
                  onBlur={() => {
                    if (editingBody !== selectedDraft.body) {
                      updateDraftBody(selectedDraft.id, editingBody);
                    }
                  }}
                  className="min-h-[140px] w-full resize-none rounded-[8px] border border-li-border-standard p-[12px] font-body text-[13px] leading-relaxed text-li-text-primary placeholder:text-li-text-disabled focus:border-li-blue focus:outline-none focus:ring-1 focus:ring-li-blue/20"
                />
                {/* Quick transforms */}
                <div className="mt-[8px] flex items-center gap-[6px]">
                  <button
                    onClick={() => handleQuickTransform('shorter')}
                    className="rounded-[6px] border border-li-border-standard px-[10px] py-[5px] font-body text-[11px] text-li-text-tertiary transition-colors hover:bg-li-bg-hover hover:text-li-text-secondary"
                  >
                    Use shorter
                  </button>
                  <button
                    onClick={() => handleQuickTransform('direct')}
                    className="rounded-[6px] border border-li-border-standard px-[10px] py-[5px] font-body text-[11px] text-li-text-tertiary transition-colors hover:bg-li-bg-hover hover:text-li-text-secondary"
                  >
                    More direct
                  </button>
                  <button
                    onClick={handleRewrite}
                    className="flex items-center gap-[4px] rounded-[6px] border border-li-border-standard px-[10px] py-[5px] font-body text-[11px] text-li-text-tertiary transition-colors hover:bg-li-bg-hover hover:text-li-text-secondary"
                  >
                    <RotateCcw size={11} />
                    Request rewrite
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between border-t border-li-border-standard px-[20px] py-[10px]">
                <div className="flex items-center gap-[4px] font-body text-[11px] text-li-text-disabled">
                  <Shield size={11} />
                  Approval required before send
                </div>
                <div className="flex items-center gap-[6px]">
                  <button
                    onClick={handleReject}
                    className="flex items-center gap-[4px] rounded-[6px] border border-li-border-standard px-[12px] py-[6px] font-body text-[12px] text-li-text-tertiary transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <X size={13} />
                    Reject
                  </button>
                  <button
                    onClick={handleApprove}
                    className="flex items-center gap-[4px] rounded-[6px] bg-green-600 px-[12px] py-[6px] font-body text-[12px] font-medium text-white transition-colors hover:bg-green-700"
                  >
                    <Check size={13} />
                    Approve
                  </button>
                  {!allApproved && filteredDrafts.findIndex((d) => d.id === selectedDraft.id) < filteredDrafts.length - 1 && (
                    <button
                      onClick={() => {
                        const nextIdx = filteredDrafts.findIndex((d) => d.id === selectedDraft.id) + 1;
                        if (nextIdx < filteredDrafts.length) handleSelectDraft(filteredDrafts[nextIdx]);
                      }}
                      className="flex items-center gap-[4px] rounded-[6px] border border-li-border-standard px-[10px] py-[6px] font-body text-[11px] text-li-text-tertiary transition-colors hover:bg-li-bg-hover"
                    >
                      Next <ArrowRight size={11} />
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <MessageSquare size={32} className="mx-auto text-li-text-disabled" />
                <p className="mt-[8px] font-body text-[13px] text-li-text-tertiary">
                  Select a draft to review
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
