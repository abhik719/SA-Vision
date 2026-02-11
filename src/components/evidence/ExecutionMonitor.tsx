import { useState, useEffect, useCallback, useRef } from 'react';
import { useOutreachStore } from '../../store/useOutreachStore';
import { useJobStore } from '../../store/useJobStore';
import { useEvidenceStore } from '../../store/useEvidenceStore';
import { useAppStore } from '../../store/useAppStore';
import { useThreadStore } from '../../store/useThreadStore';
import type { Evidence } from '../../types/evidence';
import type { ExecStatus } from '../../types/outreach';
import {
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Pause,
  UserCheck,
  MessageSquare,
  Mail,
  UserPlus,
  ArrowLeft,
  Sparkles,
  Zap,
} from 'lucide-react';

interface Props {
  evidence: Evidence;
}

const EXEC_STATUS_CONFIG: Record<ExecStatus, { label: string; color: string; icon: typeof Clock }> = {
  QUEUED: { label: 'Queued', color: 'text-li-text-tertiary bg-li-bg-tertiary', icon: Clock },
  SENT: { label: 'Sent', color: 'text-blue-700 bg-blue-50', icon: Send },
  WAITING_CONDITION: { label: 'Waiting', color: 'text-amber-700 bg-amber-50', icon: Pause },
  NEEDS_INPUT: { label: 'Needs input', color: 'text-orange-700 bg-orange-50', icon: AlertCircle },
  STOPPED_REPLY: { label: 'Stopped (reply)', color: 'text-green-700 bg-green-50', icon: CheckCircle2 },
  COMPLETED: { label: 'Completed', color: 'text-green-700 bg-green-50', icon: CheckCircle2 },
};

const STEP_ICONS: Record<string, typeof Mail> = {
  step_01: UserPlus,
  step_02: MessageSquare,
  step_03: Mail,
};

const STEP_LABELS: Record<string, string> = {
  step_01: 'Connect',
  step_02: 'LI Message',
  step_03: 'Email',
};

export default function ExecutionMonitor({ evidence }: Props) {
  const jobId = evidence.context?.jobId || 'job_outreach_01';
  const job = useJobStore((s) => s.jobsById[jobId]);
  const leadsById = useOutreachStore((s) => s.leadsById);
  const execution = useOutreachStore((s) => s.executionByJobId[jobId]);
  const setExecution = useOutreachStore((s) => s.setExecution);
  const addEvent = useOutreachStore((s) => s.addEvent);
  const updateLeadExecStatus = useOutreachStore((s) => s.updateLeadExecStatus);
  const setJobStatus = useJobStore((s) => s.setJobStatus);
  const updateEvidence = useEvidenceStore((s) => s.updateEvidence);
  const setCurrentEvidence = useAppStore((s) => s.setCurrentEvidence);
  const addMessage = useThreadStore((s) => s.addMessage);

  const [showSchedule, setShowSchedule] = useState(!job || job.status === 'READY');
  const [maxPerDay, setMaxPerDay] = useState(20);
  const [startTime, setStartTime] = useState('now');
  const simulationRan = useRef(false);

  // Initialize execution data if not present
  useEffect(() => {
    if (!execution && evidence.executionByLead) {
      setExecution(jobId, {
        byLead: evidence.executionByLead,
        events: evidence.executionEvents || [],
      });
    }
  }, [execution, evidence, jobId, setExecution]);

  const byLead = execution?.byLead || evidence.executionByLead || [];
  const events = execution?.events || evidence.executionEvents || [];

  // Summary
  const summary = {
    total: byLead.length,
    sent: byLead.filter((l) => l.status === 'SENT').length,
    waiting: byLead.filter((l) => l.status === 'WAITING_CONDITION').length,
    replied: byLead.filter((l) => l.status === 'STOPPED_REPLY').length,
    completed: byLead.filter((l) => l.status === 'COMPLETED').length,
    queued: byLead.filter((l) => l.status === 'QUEUED').length,
  };

  const simulateExecution = useCallback(() => {
    if (simulationRan.current) return;
    simulationRan.current = true;

    const leadIds = byLead.map((l) => l.leadId);
    let delay = 0;

    // Simulate sending connection requests
    leadIds.forEach((leadId, idx) => {
      delay += 600 + Math.random() * 400;
      const lead = leadsById[leadId];
      const leadName = lead?.fullName || leadId;

      setTimeout(() => {
        updateLeadExecStatus(jobId, leadId, 'SENT');
        addEvent(jobId, {
          id: `evt_sent_${idx}`,
          leadId,
          stepId: 'step_01',
          type: 'SENT',
          timestamp: new Date().toISOString(),
          message: `Connection request sent to ${leadName}`,
        });
      }, delay);
    });

    // Simulate some accepts after a delay
    const acceptIndices = [0, 2, 4]; // 3 accepts
    acceptIndices.forEach((idx) => {
      delay += 800;
      const leadId = leadIds[idx];
      const lead = leadsById[leadId];
      const leadName = lead?.fullName || leadId;

      setTimeout(() => {
        updateLeadExecStatus(jobId, leadId, 'WAITING_CONDITION');
        addEvent(jobId, {
          id: `evt_accept_${idx}`,
          leadId,
          stepId: 'step_01',
          type: 'CONNECT_ACCEPTED',
          timestamp: new Date().toISOString(),
          message: `${leadName} accepted your connection request`,
        });
      }, delay);
    });

    // Non-accepted leads move to email fallback
    const noResponseIndices = [1, 3, 5, 6, 7];
    noResponseIndices.forEach((idx) => {
      if (idx >= leadIds.length) return;
      delay += 300;
      const leadId = leadIds[idx];

      setTimeout(() => {
        updateLeadExecStatus(jobId, leadId, 'WAITING_CONDITION', null);
      }, delay);
    });

    // Simulate a reply
    delay += 1000;
    setTimeout(() => {
      if (leadIds.length > 0) {
        const replyLeadId = leadIds[0];
        const lead = leadsById[replyLeadId];
        const leadName = lead?.fullName || replyLeadId;
        updateLeadExecStatus(jobId, replyLeadId, 'STOPPED_REPLY');
        addEvent(jobId, {
          id: 'evt_reply_01',
          leadId: replyLeadId,
          stepId: 'step_01',
          type: 'REPLY_RECEIVED',
          timestamp: new Date().toISOString(),
          message: `${leadName} replied to your connection request`,
        });
      }
    }, delay);

    // Agent suggestion in thread
    delay += 800;
    setTimeout(() => {
      const threadId = evidence.context?.threadId;
      if (threadId) {
        addMessage(threadId, {
          id: `msg_exec_update_${Date.now()}`,
          role: 'agent',
          timestamp: new Date().toISOString(),
          content: `**Outreach update:** 3 connects accepted, 1 reply received. Want me to draft follow-up messages for the accepted connections?`,
          cardType: 'DECISION_CHIPS',
          cardData: ['Yes — draft follow-ups', 'Skip for now', 'Show me the full status'],
        });
      }
    }, delay);

    // Update evidence summary
    delay += 200;
    setTimeout(() => {
      updateEvidence(evidence.id, {
        executionSummary: {
          total: leadIds.length,
          sent: leadIds.length,
          waiting: noResponseIndices.length,
          replied: 1,
        },
      });
    }, delay);
  }, [jobId, byLead, leadsById, updateLeadExecStatus, addEvent, evidence, addMessage, updateEvidence]);

  const handleScheduleAndRun = () => {
    setShowSchedule(false);
    setJobStatus(jobId, 'RUNNING');

    const threadId = evidence.context?.threadId;
    if (threadId) {
      addMessage(threadId, {
        id: `msg_exec_start_${Date.now()}`,
        role: 'agent',
        timestamp: new Date().toISOString(),
        content: `Outreach job scheduled and running. Sending connection requests to ${byLead.length} leads. I'll notify you of accepts and replies.`,
      });
    }

    // Start simulation
    setTimeout(simulateExecution, 500);
  };

  // Auto-simulate if job is already RUNNING when component mounts
  useEffect(() => {
    if (job?.status === 'RUNNING' && !simulationRan.current) {
      simulateExecution();
    }
  }, [job?.status, simulateExecution]);

  if (showSchedule && job?.status !== 'RUNNING') {
    return (
      <div className="flex h-full flex-col items-center justify-center px-[40px]">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-[24px]">
            <div className="mx-auto flex h-[48px] w-[48px] items-center justify-center rounded-full bg-li-blue/10 mb-[12px]">
              <Play size={24} className="text-li-blue" />
            </div>
            <h3 className="font-display text-[16px] font-semibold text-li-text-primary">Schedule outreach</h3>
            <p className="mt-[4px] font-body text-[13px] text-li-text-tertiary">
              Confirm settings and start sending to {byLead.length} leads
            </p>
          </div>

          <div className="space-y-[12px] rounded-[10px] border border-li-border-standard p-[16px]">
            {/* Start time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[8px]">
                <Clock size={14} className="text-li-text-tertiary" />
                <span className="font-body text-[12px] text-li-text-secondary">Start time</span>
              </div>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="rounded-[6px] border border-li-border-standard px-[8px] py-[4px] font-body text-[12px] text-li-text-primary"
              >
                <option value="now">Now</option>
                <option value="9am">Tomorrow 9:00 AM</option>
                <option value="custom">Custom...</option>
              </select>
            </div>
            {/* Max/day */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[8px]">
                <Send size={14} className="text-li-text-tertiary" />
                <span className="font-body text-[12px] text-li-text-secondary">Max sends/day</span>
              </div>
              <input
                type="number"
                value={maxPerDay}
                onChange={(e) => setMaxPerDay(parseInt(e.target.value) || 20)}
                className="w-[60px] rounded-[6px] border border-li-border-standard px-[8px] py-[4px] text-center font-body text-[12px] text-li-text-primary"
              />
            </div>
            {/* Follow-up delays */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[8px]">
                <Pause size={14} className="text-li-text-tertiary" />
                <span className="font-body text-[12px] text-li-text-secondary">Follow-up delay</span>
              </div>
              <span className="font-body text-[12px] text-li-text-tertiary">As planned (Day 1, Day 2)</span>
            </div>
          </div>

          <div className="mt-[16px] flex items-center justify-center gap-[8px]">
            <button
              onClick={() => setCurrentEvidence('ev_outreach_drafts_01')}
              className="flex items-center gap-[4px] rounded-[8px] border border-li-border-standard px-[14px] py-[8px] font-body text-[12px] text-li-text-secondary transition-colors hover:bg-li-bg-hover"
            >
              <ArrowLeft size={14} />
              Back to drafts
            </button>
            <button
              onClick={handleScheduleAndRun}
              className="flex items-center gap-[6px] rounded-[8px] bg-li-blue px-[16px] py-[8px] font-body text-[13px] font-medium text-white transition-colors hover:bg-li-blue-dark"
            >
              <Play size={14} />
              Schedule & run
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Summary row */}
      <div className="flex items-center gap-[16px] border-b border-li-border-standard px-[20px] py-[12px]">
        <div className="flex items-center gap-[6px]">
          <Zap size={14} className="text-li-blue" />
          <span className="font-display text-[14px] font-semibold text-li-text-primary">Outreach running</span>
        </div>
        <div className="flex items-center gap-[12px] font-body text-[12px] text-li-text-tertiary">
          <span>Leads: <strong className="text-li-text-primary">{summary.total}</strong></span>
          <span>Sent: <strong className="text-blue-600">{summary.sent}</strong></span>
          <span>Waiting: <strong className="text-amber-600">{summary.waiting}</strong></span>
          <span>Replied: <strong className="text-green-600">{summary.replied}</strong></span>
          <span>Queued: <strong className="text-li-text-secondary">{summary.queued}</strong></span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main table */}
        <div className="flex-1 overflow-y-auto li-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="border-b border-li-border-standard bg-li-bg-secondary">
                <th className="px-[12px] py-[8px] text-left font-body text-[11px] font-semibold text-li-text-tertiary">Lead</th>
                <th className="px-[12px] py-[8px] text-left font-body text-[11px] font-semibold text-li-text-tertiary">Step</th>
                <th className="px-[12px] py-[8px] text-left font-body text-[11px] font-semibold text-li-text-tertiary">Status</th>
                <th className="px-[12px] py-[8px] text-left font-body text-[11px] font-semibold text-li-text-tertiary">Last event</th>
              </tr>
            </thead>
            <tbody>
              {byLead.map((leadExec) => {
                const lead = leadsById[leadExec.leadId];
                const statusConfig = EXEC_STATUS_CONFIG[leadExec.status];
                const StatusIcon = statusConfig.icon;
                const StepIcon = STEP_ICONS[leadExec.currentStepId] || Send;
                const lastEvent = [...events].reverse().find((e) => e.leadId === leadExec.leadId);

                return (
                  <tr key={leadExec.leadId} className="border-b border-li-border-standard transition-colors hover:bg-li-bg-hover">
                    <td className="px-[12px] py-[8px]">
                      <div className="flex items-center gap-[6px]">
                        <div className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-li-bg-tertiary text-[9px] font-semibold text-li-text-secondary">
                          {(lead?.fullName || leadExec.leadId).split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-body text-[12px] font-medium text-li-text-primary">
                            {lead?.fullName || leadExec.leadId}
                          </div>
                          <div className="font-body text-[10px] text-li-text-tertiary">
                            {lead?.company.name || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-[12px] py-[8px]">
                      <div className="flex items-center gap-[4px]">
                        <StepIcon size={12} className="text-li-text-disabled" />
                        <span className="font-body text-[11px] text-li-text-secondary">
                          {STEP_LABELS[leadExec.currentStepId] || leadExec.currentStepId}
                        </span>
                      </div>
                    </td>
                    <td className="px-[12px] py-[8px]">
                      <span className={`inline-flex items-center gap-[3px] rounded-[4px] px-[6px] py-[2px] font-body text-[10px] font-medium ${statusConfig.color}`}>
                        <StatusIcon size={10} />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-[12px] py-[8px]">
                      <span className="font-body text-[11px] text-li-text-tertiary">
                        {lastEvent?.message || '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Events sidebar */}
        <div className="w-[260px] shrink-0 overflow-y-auto border-l border-li-border-standard bg-li-bg-secondary li-scrollbar">
          <div className="px-[12px] py-[10px]">
            <h4 className="font-display text-[12px] font-semibold text-li-text-secondary mb-[8px]">Events</h4>
            {events.length === 0 ? (
              <p className="font-body text-[11px] text-li-text-disabled">Waiting for events...</p>
            ) : (
              <div className="space-y-[6px]">
                {[...events].reverse().map((event) => {
                  const isAccept = event.type === 'CONNECT_ACCEPTED';
                  const isReply = event.type === 'REPLY_RECEIVED';
                  const EventIcon = isAccept ? UserCheck : isReply ? MessageSquare : Send;
                  return (
                    <div
                      key={event.id}
                      className={`rounded-[6px] p-[8px] ${
                        isAccept || isReply ? 'bg-green-50 border border-green-100' : 'bg-white border border-li-border-standard'
                      }`}
                    >
                      <div className="flex items-start gap-[6px]">
                        <EventIcon size={12} className={isAccept || isReply ? 'text-green-600 mt-[2px]' : 'text-li-text-disabled mt-[2px]'} />
                        <div>
                          <div className="font-body text-[11px] text-li-text-primary">{event.message}</div>
                          <div className="font-body text-[10px] text-li-text-disabled mt-[2px]">
                            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      {(isAccept || isReply) && (
                        <div className="mt-[4px] flex items-center gap-[4px]">
                          <Sparkles size={10} className="text-amber-500" />
                          <span className="font-body text-[10px] text-li-text-tertiary">
                            {isReply ? 'Sequence stopped — reply received' : 'Ready for follow-up message'}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
