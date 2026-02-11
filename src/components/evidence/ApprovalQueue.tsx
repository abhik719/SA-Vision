import { useState, useMemo } from 'react';
import type { Evidence, ApprovalItem } from '../../types/evidence';
import { useEvidenceStore } from '../../store/useEvidenceStore';
import { useJobStore } from '../../store/useJobStore';
import EvidenceHeader from './EvidenceHeader';
import Button from '../ui/Button';
import { getLeadAvatar } from '../../data/leadAvatars';
import {
  Check,
  X,
  CheckCheck,

  Copy,
  Paperclip,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';
import type { DraftStatus } from '../../types/common';

interface Props {
  evidence: Evidence;
  hideHeader?: boolean;
}

const QUICK_EDITS = ['More casual', 'More formal', 'Longer', 'Shorter'];

export default function ApprovalQueue({ evidence, hideHeader }: Props) {
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(
    evidence.items?.[0]?.draftId || null
  );
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [customInstruction, setCustomInstruction] = useState('');
  const [selectedTalkingPoints, setSelectedTalkingPoints] = useState<Set<number>>(new Set());
  const updateEvidence = useEvidenceStore((s) => s.updateEvidence);
  const setJobStatus = useJobStore((s) => s.setJobStatus);
  const addMessageToJob = useJobStore((s) => s.addMessage);

  const items = useMemo(() => evidence.items || [], [evidence.items]);
  const selectedDraft = items.find((i) => i.draftId === selectedDraftId);
  const selectedIdx = items.findIndex((i) => i.draftId === selectedDraftId);

  const updateDraftStatus = (draftId: string, status: DraftStatus) => {
    const updated = items.map((item) =>
      item.draftId === draftId ? { ...item, status } : item
    );
    updateEvidence(evidence.id, { items: updated });
  };

  const _updateDraftMessage = (draftId: string, message: string) => {
    const updated = items.map((item) =>
      item.draftId === draftId ? { ...item, message, status: 'EDITED' as DraftStatus } : item
    );
    updateEvidence(evidence.id, { items: updated });
    setEditingMessage(null);
  };
  // Expose for future use
  void _updateDraftMessage;

  const approveAll = () => {
    const updated = items.map((item) =>
      item.status === 'PENDING' || item.status === 'EDITED'
        ? { ...item, status: 'APPROVED' as DraftStatus }
        : item
    );
    updateEvidence(evidence.id, { items: updated });
    checkCompletion(updated);
  };

  const handleSend = () => {
    if (!selectedDraft) return;
    updateDraftStatus(selectedDraft.draftId, 'APPROVED');
    advanceToNext(selectedDraft.draftId, 'APPROVED');
  };

  const handleReject = () => {
    if (!selectedDraft) return;
    updateDraftStatus(selectedDraft.draftId, 'REJECTED');
    advanceToNext(selectedDraft.draftId, 'REJECTED');
  };

  const advanceToNext = (currentId: string, newStatus: DraftStatus) => {
    const next = items.find(
      (i) => i.draftId !== currentId && i.status === 'PENDING'
    );
    if (next) {
      setSelectedDraftId(next.draftId);
      setEditingMessage(null);
    }
    checkCompletion(
      items.map((item) =>
        item.draftId === currentId ? { ...item, status: newStatus } : item
      )
    );
  };

  const _viewNextLead = () => {
    if (selectedIdx < items.length - 1) {
      setSelectedDraftId(items[selectedIdx + 1].draftId);
      setEditingMessage(null);
    }
  };
  void _viewNextLead;

  const toggleTalkingPoint = (idx: number) => {
    setSelectedTalkingPoints((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const checkCompletion = (updated: ApprovalItem[]) => {
    const allDone = updated.every((i) => i.status !== 'PENDING');
    if (allDone && evidence.context?.jobId) {
      setJobStatus(evidence.context.jobId, 'COMPLETED');
      const approved = updated.filter((i) => i.status === 'APPROVED' || i.status === 'EDITED').length;
      const { jobsById } = useJobStore.getState();
      const job = jobsById[evidence.context.jobId];
      if (job) {
        // Post result to parent job (or to the job itself)
        const parentJobId = job.linked_context?.parent_job_id || job.id;
        addMessageToJob(parentJobId, {
          id: `msg_${Date.now()}`,
          role: 'agent',
          timestamp: new Date().toISOString(),
          content: `Outreach review complete: ${approved} drafts approved.`,
          cardType: 'JOB_RESULT',
          cardData: {
            jobId: job.id,
            jobTitle: job.title,
            completedTime: new Date().toISOString(),
            highlights: [
              `${approved} drafts approved`,
              `${updated.filter((i) => i.status === 'REJECTED').length} rejected`,
            ],
          },
        });
      }
    }
  };

  const pendingCount = items.filter((i) => i.status === 'PENDING').length;
  const approvedCount = items.filter((i) => i.status === 'APPROVED' || i.status === 'EDITED').length;

  const messageText = editingMessage ?? selectedDraft?.message ?? '';
  const charCount = messageText.length;

  return (
    <div className="flex h-full flex-col">
      {!hideHeader && (
        <EvidenceHeader
          breadcrumb="Job • Needs Approval"
          title={evidence.title}
        />
      )}

      {/* Compact toolbar */}
      <div
        className="flex items-center gap-[8px] px-[16px] py-[6px]"
        style={{ borderBottom: '1px solid var(--border-standard)' }}
      >
        <span className="font-body text-[12px] text-li-text-secondary">
          {pendingCount} pending · {approvedCount} approved · {items.length} total
        </span>
        <div className="ml-auto flex items-center gap-[6px]">
          <Button size="sm" onClick={approveAll}>
            <CheckCheck size={12} className="mr-[4px]" /> Approve all
          </Button>
        </div>
      </div>

      {/* Split: lead list + draft editor */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar: lead list */}
        <div
          className="w-[220px] shrink-0 overflow-y-auto li-scrollbar bg-white"
          style={{ borderRight: '1px solid var(--border-standard)' }}
        >
          {items.map((item) => {
            const isSelected = selectedDraftId === item.draftId;
            const avatar = getLeadAvatar(item.leadId);
            return (
              <button
                key={item.draftId}
                onClick={() => {
                  setSelectedDraftId(item.draftId);
                  setEditingMessage(null);
                }}
                className={clsx(
                  'relative flex w-full items-center gap-[10px] px-[12px] py-[10px] text-left transition-colors',
                  isSelected
                    ? 'border-l-[3px] border-l-li-blue bg-li-bg-selected'
                    : 'border-l-[3px] border-l-transparent hover:bg-li-bg-hover'
                )}
                style={{ borderBottom: '1px solid var(--border-standard)' }}
              >
                <div className="relative shrink-0">
                  {avatar ? (
                    <img src={avatar} alt={item.leadName} className="h-[36px] w-[36px] rounded-full object-cover" />
                  ) : (
                    <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-li-bg-tertiary font-body text-[13px] font-semibold text-li-text-secondary">
                      {item.leadName.split(' ').map((n) => n[0]).join('')}
                    </div>
                  )}
                  <span
                    className={clsx(
                      'absolute -bottom-[1px] -right-[1px] h-[10px] w-[10px] rounded-full border-2 border-white',
                      item.status === 'APPROVED' && 'bg-[#2F7B15]',
                      item.status === 'REJECTED' && 'bg-[#CC1016]',
                      item.status === 'EDITED' && 'bg-li-blue',
                      item.status === 'PENDING' && 'bg-[#C37D16]'
                    )}
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-body text-[13px] font-semibold text-li-text-primary">
                    {item.leadName}
                  </span>
                  <span className="truncate font-body text-[11px] text-li-text-tertiary">
                    {item.accountName}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main content: draft editor + editing tools */}
        {selectedDraft ? (
          <div className="flex flex-1 overflow-hidden">
            {/* Left: message compose area */}
            <div className="flex min-w-0 flex-1 flex-col bg-white" style={{ borderRight: '1px solid var(--border-standard)' }}>
              {/* Lead header bar */}
              <div className="flex items-center gap-[10px] px-[20px] py-[12px]" style={{ borderBottom: '1px solid var(--border-standard)' }}>
                {(() => {
                  const av = getLeadAvatar(selectedDraft.leadId);
                  return av ? (
                    <img src={av} alt={selectedDraft.leadName} className="h-[32px] w-[32px] rounded-full object-cover" />
                  ) : (
                    <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-li-bg-tertiary font-body text-[12px] font-semibold text-li-text-secondary">
                      {selectedDraft.leadName.split(' ').map((n) => n[0]).join('')}
                    </div>
                  );
                })()}
                <div className="flex flex-col">
                  <div className="flex items-center gap-[6px]">
                    <span className="font-body text-[14px] font-semibold text-li-text-primary">
                      {selectedDraft.leadName}
                    </span>
                    <span className="rounded-[3px] bg-li-bg-tertiary px-[5px] py-[1px] font-body text-[10px] text-li-text-tertiary">
                      2nd
                    </span>
                  </div>
                  <span className="font-body text-[11px] text-li-text-tertiary">
                    {selectedDraft.accountName}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-[6px]">
                  <button
                    onClick={handleReject}
                    className="rounded p-[4px] text-li-text-tertiary transition-colors hover:bg-li-bg-hover hover:text-[#CC1016]"
                    title="Reject"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Message body */}
              <div className="flex-1 overflow-y-auto li-scrollbar px-[20px] py-[16px]">
                {/* Subject line */}
                <div className="mb-[12px] font-body text-[14px] font-semibold text-li-text-primary">
                  Re: {selectedDraft.accountName} × Your Team
                </div>

                {editingMessage !== null ? (
                  <textarea
                    value={editingMessage}
                    onChange={(e) => setEditingMessage(e.target.value)}
                    className="min-h-[200px] w-full resize-none rounded-[6px] border border-li-border-standard bg-white p-[12px] font-body text-[13px] leading-[1.7] text-li-text-primary focus:border-li-blue focus:outline-none"
                  />
                ) : (
                  <div
                    className="cursor-text font-body text-[13px] leading-[1.7] text-li-text-primary"
                    onClick={() => setEditingMessage(selectedDraft.message)}
                  >
                    {selectedDraft.message}
                  </div>
                )}

                {/* AI disclaimer + feedback */}
                <div className="mt-[16px] flex items-center justify-between">
                  <span className="font-body text-[11px] text-li-text-disabled">
                    Review AI-powered content carefully.
                  </span>
                  <div className="flex items-center gap-[4px]">
                    <button className="rounded p-[3px] text-li-text-disabled hover:bg-li-bg-hover hover:text-li-text-secondary" title="Good draft">
                      <ThumbsUp size={13} />
                    </button>
                    <button className="rounded p-[3px] text-li-text-disabled hover:bg-li-bg-hover hover:text-li-text-secondary" title="Needs improvement">
                      <ThumbsDown size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom toolbar: copy, attach, CRM, char count, Send */}
              <div
                className="flex items-center gap-[8px] px-[20px] py-[10px]"
                style={{ borderTop: '1px solid var(--border-standard)' }}
              >
                <button className="rounded p-[5px] text-li-text-tertiary hover:bg-li-bg-hover" title="Copy to clipboard">
                  <Copy size={15} />
                </button>
                <button className="rounded p-[5px] text-li-text-tertiary hover:bg-li-bg-hover" title="Attach">
                  <Paperclip size={15} />
                </button>
                <div className="flex items-center gap-[4px]">
                  <span className="inline-flex h-[16px] w-[16px] items-center justify-center rounded-[3px] bg-[#2F7B15]">
                    <Check size={10} className="text-white" />
                  </span>
                  <span className="font-body text-[12px] text-li-text-secondary">Log to CRM</span>
                </div>
                <div className="ml-auto flex items-center gap-[10px]">
                  <span className="font-body text-[12px] text-li-text-disabled">{charCount}</span>
                  <Button size="sm" onClick={handleSend}>Send</Button>
                </div>
              </div>
            </div>

            {/* Right: editing tools panel */}
            <div className="w-[300px] shrink-0 overflow-y-auto bg-white p-[20px] li-scrollbar">
              <h4 className="font-display text-[15px] font-semibold text-li-text-primary">
                How can I help you edit this message?
              </h4>

              {/* Quick editing */}
              <div className="mt-[16px]">
                <span className="font-body text-[13px] font-semibold text-li-text-primary">
                  Quick editing
                </span>
                <div className="mt-[8px] flex flex-wrap gap-[6px]">
                  {QUICK_EDITS.map((label) => (
                    <button
                      key={label}
                      className="rounded-[6px] border border-li-border-standard bg-white px-[12px] py-[6px] font-body text-[13px] text-li-text-primary transition-colors hover:border-li-text-tertiary hover:bg-li-bg-hover"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Talking points */}
              <div className="mt-[20px]">
                <span className="font-body text-[13px] font-semibold text-li-text-primary">
                  Talking points
                </span>
                <div className="mt-[8px] flex flex-col gap-[6px]">
                  {selectedDraft.signals.map((signal, idx) => {
                    const isActive = selectedTalkingPoints.has(idx);
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleTalkingPoint(idx)}
                        className={clsx(
                          'flex items-center gap-[8px] rounded-[6px] border px-[12px] py-[8px] text-left font-body text-[13px] transition-colors',
                          isActive
                            ? 'border-li-text-tertiary bg-li-bg-secondary text-li-text-primary'
                            : 'border-li-border-standard bg-white text-li-text-secondary hover:border-li-text-tertiary'
                        )}
                      >
                        {isActive && (
                          <Check size={14} className="shrink-0 text-li-text-secondary" />
                        )}
                        <span className={isActive ? '' : 'pl-[22px]'}>{signal}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom instructions */}
              <div className="mt-[20px]">
                <span className="font-body text-[13px] font-semibold text-li-text-primary">
                  Custom instructions
                </span>
                <div className="mt-[8px]">
                  <div className="flex items-center gap-[6px] rounded-[6px] border border-li-border-standard bg-white px-[12px] py-[8px]">
                    <input
                      value={customInstruction}
                      onChange={(e) => setCustomInstruction(e.target.value)}
                      placeholder="e.g. Maintain a friendly yet professional tone."
                      className="min-w-0 flex-1 font-body text-[13px] text-li-text-primary placeholder:text-li-text-disabled focus:outline-none"
                    />
                  </div>
                  {customInstruction && (
                    <div className="mt-[6px] flex items-center gap-[6px]">
                      <Sparkles size={13} className="text-li-blue" />
                      <span className="font-body text-[12px] text-li-text-tertiary">
                        Reviewing your custom instruction...
                      </span>
                      <div className="ml-auto flex items-center gap-[4px]">
                        <button
                          onClick={() => setCustomInstruction('')}
                          className="rounded p-[3px] text-li-text-tertiary hover:bg-li-bg-hover"
                        >
                          <X size={13} />
                        </button>
                        <button className="rounded p-[3px] text-li-text-tertiary hover:bg-li-bg-hover">
                          <Check size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <span className="font-body text-ds-base text-li-text-tertiary">
              Select a draft to review
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
