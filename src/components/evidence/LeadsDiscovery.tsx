import { useState, useRef, useEffect } from 'react';
import type { Evidence, DiscoveryLeadRow } from '../../types/evidence';
import type { Message } from '../../types/thread';
import { useAppStore } from '../../store/useAppStore';
import { useJobStore } from '../../store/useJobStore';
import { processSellerMessage } from '../../flows/engine';
import EvidenceHeader from './EvidenceHeader';
import { Send, Save, Rocket, ChevronRight, Mail, Linkedin } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  evidence: Evidence;
  hideHeader?: boolean;
}

const SIGNAL_COLORS: Record<string, string> = {
  job_change: 'bg-[#EDE7F6] text-[#7C3AED]',
  engagement: 'bg-[#E8F5E9] text-[#2E7D32]',
  intent: 'bg-[#E3F2FD] text-[#1565C0]',
  tech_stack: 'bg-[#FFF3E0] text-[#E65100]',
};

/** Render markdown **bold** in message text */
function renderMessage(message: string) {
  const parts = message.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

export default function LeadsDiscovery({ evidence, hideHeader }: Props) {
  const selectedJobId = useAppStore((s) => s.selectedJobId);
  const jobsById = useJobStore((s) => s.jobsById);
  const addMessage = useJobStore((s) => s.addMessage);

  const leads = (evidence.leadsDiscovery || []) as DiscoveryLeadRow[];
  const totalCount = evidence.totalLeadsCount || leads.length;
  const quickResponses = evidence.quickResponses || [];

  // Get messages from the parent job (if any)
  const job = selectedJobId ? jobsById[selectedJobId] : null;
  const messages = job?.messages || [];

  // Chat input state
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [hoveredLead, setHoveredLead] = useState<string | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = (text: string) => {
    if (!text.trim() || !selectedJobId) return;
    addMessage(selectedJobId, {
      id: `msg_${Date.now()}`,
      role: 'seller',
      timestamp: new Date().toISOString(),
      content: text.trim(),
    });
    setChatInput('');
    setTimeout(() => processSellerMessage(selectedJobId, text.trim()), 100);
  };

  const handleQuickResponse = (response: string) => {
    handleSend(response);
  };

  const handleFinalAction = (action: 'save' | 'outreach') => {
    if (!selectedJobId) return;
    const msg = action === 'save'
      ? 'Save this lead list'
      : 'Start outreach campaign for these leads';
    handleSend(msg);
  };

  // Show the top 5 leads
  const displayLeads = leads.slice(0, 5);
  const moreCount = totalCount - displayLeads.length;

  // Check if conversation has reached "final" state (agent mentioned "ready" or "final")
  const lastAgentMsg = [...messages].reverse().find((m) => m.role === 'agent');
  const showFinalActions = lastAgentMsg?.content?.includes('ready') && messages.filter((m) => m.role === 'seller').length >= 2;

  return (
    <div className="flex h-full flex-col">
      {!hideHeader && (
        <EvidenceHeader breadcrumb="Agent • Lead Discovery" title={evidence.title} />
      )}

      {/* Split pane: leads table (60%) + chat (40%) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Lead Table */}
        <div className="flex w-[60%] flex-col border-r" style={{ borderColor: 'var(--border-standard)' }}>
          {/* Summary bar */}
          <div
            className="flex items-center justify-between bg-white px-[20px] py-[10px]"
            style={{ borderBottom: '1px solid var(--border-standard)' }}
          >
            <span className="font-body text-[13px] text-li-text-secondary">
              Showing top {displayLeads.length} of {totalCount} leads
            </span>
          </div>

          {/* Lead rows */}
          <div className="flex-1 overflow-auto li-scrollbar">
            {displayLeads.map((lead) => (
              <div
                key={lead.id}
                className="relative border-b transition-colors hover:bg-li-bg-hover"
                style={{ borderColor: 'var(--border-standard)' }}
                onMouseEnter={() => setHoveredLead(lead.id)}
                onMouseLeave={() => setHoveredLead(null)}
              >
                <div className="flex items-start gap-[12px] px-[20px] py-[14px]">
                  {/* Avatar placeholder */}
                  <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#0A66C2]">
                    <span className="font-body text-[14px] font-semibold text-white">
                      {lead.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-[4px]">
                    <div className="flex items-center justify-between">
                      <span className="font-body text-ds-base font-semibold text-li-text-primary">
                        {lead.name}
                      </span>
                      {/* Score bar */}
                      <div className="flex items-center gap-[6px]">
                        <div className="h-[6px] w-[48px] overflow-hidden rounded-full bg-li-bg-tertiary">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${lead.score}%`,
                              background: `linear-gradient(90deg, #7C3AED, #0A66C2)`,
                            }}
                          />
                        </div>
                        <span className="font-body text-[11px] font-semibold text-li-text-tertiary">
                          {lead.score}
                        </span>
                      </div>
                    </div>
                    <span className="font-body text-ds-small text-li-text-secondary">
                      {lead.title} · {lead.company}
                    </span>
                    <div className="flex items-center gap-[6px]">
                      <span className={clsx(
                        'inline-flex rounded-full px-[6px] py-[1px] font-body text-[10px] font-medium',
                        SIGNAL_COLORS[lead.signalType] || 'bg-li-tag-bg text-li-text-tertiary'
                      )}>
                        {lead.signal}
                      </span>
                    </div>
                    <span className="font-body text-[11px] text-li-text-disabled">
                      {lead.rationale}
                    </span>
                  </div>

                  {/* Hover actions */}
                  {hoveredLead === lead.id && (
                    <div className="absolute right-[16px] top-[14px] flex items-center gap-[4px]">
                      <button className="rounded-[6px] bg-white p-[6px] text-li-text-tertiary shadow-sm transition-colors hover:bg-li-bg-hover hover:text-li-blue" title="Email">
                        <Mail size={14} />
                      </button>
                      <button className="rounded-[6px] bg-white p-[6px] text-li-text-tertiary shadow-sm transition-colors hover:bg-li-bg-hover hover:text-li-blue" title="LinkedIn">
                        <Linkedin size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* More leads indicator */}
            {moreCount > 0 && (
              <div className="flex items-center justify-center py-[16px]">
                <span className="font-body text-ds-small text-li-text-disabled">
                  + {moreCount} more leads available
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Chat Interface */}
        <div className="flex w-[40%] flex-col bg-li-bg-tertiary">
          {/* Chat header */}
          <div
            className="flex items-center gap-[8px] bg-white px-[16px] py-[10px]"
            style={{ borderBottom: '1px solid var(--border-standard)' }}
          >
            <div
              className="flex h-[24px] w-[24px] items-center justify-center rounded-full"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #0A66C2)' }}
            >
              <span className="text-[11px] font-semibold text-white">AI</span>
            </div>
            <span className="font-body text-ds-base font-semibold text-li-text-primary">
              Refine leads
            </span>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-auto li-scrollbar px-[16px] py-[12px]">
            <div className="flex flex-col gap-[12px]">
              {/* Show recent messages relevant to this phase */}
              {messages
                .filter((m) => {
                  // Show messages from the leads discovery phase onward
                  // Find the index of the first "leads" related message
                  const idx = messages.indexOf(m);
                  const leadsStart = messages.findIndex((msg) =>
                    msg.content.toLowerCase().includes('identified') && msg.content.toLowerCase().includes('lead')
                  );
                  return leadsStart >= 0 ? idx >= leadsStart : idx >= messages.length - 4;
                })
                .map((msg: Message) => (
                  <div
                    key={msg.id}
                    className={clsx(
                      'max-w-[90%] rounded-[12px] px-[14px] py-[10px] font-body text-ds-small',
                      msg.role === 'agent'
                        ? 'self-start bg-white text-li-text-primary shadow-sm'
                        : 'self-end bg-li-blue text-white'
                    )}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {renderMessage(msg.content)}
                    </div>
                  </div>
                ))}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Quick response buttons */}
          {quickResponses.length > 0 && !showFinalActions && (
            <div className="flex flex-col gap-[6px] px-[16px] pb-[8px]">
              {quickResponses.map((response, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickResponse(response)}
                  className="flex items-center gap-[6px] rounded-[8px] border border-li-border-standard bg-white px-[12px] py-[8px] text-left font-body text-[12px] text-li-text-secondary transition-colors hover:border-li-blue hover:bg-li-blue/5 hover:text-li-blue"
                >
                  <ChevronRight size={12} className="shrink-0 text-li-text-disabled" />
                  {response}
                </button>
              ))}
            </div>
          )}

          {/* Final action buttons */}
          {showFinalActions && (
            <div
              className="flex items-center gap-[8px] px-[16px] py-[12px]"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.05), rgba(10,102,194,0.05))',
                borderTop: '1px solid var(--border-standard)',
              }}
            >
              <button
                onClick={() => handleFinalAction('save')}
                className="flex items-center gap-[6px] rounded-[8px] border border-li-border-standard bg-white px-[14px] py-[8px] font-body text-[13px] font-medium text-li-text-secondary transition-colors hover:bg-li-bg-hover"
              >
                <Save size={14} />
                Save list
              </button>
              <button
                onClick={() => handleFinalAction('outreach')}
                className="flex items-center gap-[6px] rounded-[8px] bg-li-blue px-[14px] py-[8px] font-body text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-li-blue-dark"
              >
                <Rocket size={14} />
                Start outreach
              </button>
            </div>
          )}

          {/* Chat input */}
          <div
            className="flex items-center gap-[8px] bg-white px-[16px] py-[10px]"
            style={{ borderTop: '1px solid var(--border-standard)' }}
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(chatInput);
                }
              }}
              placeholder="Refine the list..."
              className="flex-1 rounded-[8px] border border-li-border-standard bg-li-bg-tertiary px-[12px] py-[8px] font-body text-ds-small text-li-text-primary placeholder:text-li-text-disabled focus:border-li-blue focus:outline-none"
            />
            <button
              onClick={() => handleSend(chatInput)}
              disabled={!chatInput.trim()}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-li-blue text-white transition-colors hover:bg-li-blue-dark disabled:opacity-40"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
