import { useState } from 'react';
import type { Evidence } from '../../types/evidence';
import { TERMS } from '../../constants/terms';
import type { SignalFeedbackCardData, SignalFeedbackOption } from '../../types/thread';
import { useAppStore } from '../../store/useAppStore';
import { useJobStore } from '../../store/useJobStore';
import AgentHomeInput from './AgentHomeInput';
import StartPointChips from './StartPointChips';
import SectionHeader from './SectionHeader';
import SignalCardComponent from './SignalCardComponent';
import JobTileComponent from './JobTileComponent';
import { ThumbsUp, ThumbsDown, MessageCircle, ArrowRight } from 'lucide-react';

interface Props {
  evidence: Evidence;
}

export default function AgentHome({ evidence }: Props) {
  const selectJob = useAppStore((s) => s.selectJob);
  const createJob = useJobStore((s) => s.createJob);
  const addMessage = useJobStore((s) => s.addMessage);
  const jobsById = useJobStore((s) => s.jobsById);
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);

  const placeholders = evidence.inputPlaceholders || [];
  const chips = evidence.chips || [];
  const signalCards = evidence.signalCards || [];
  const allJobTiles = evidence.jobTiles || [];

  // Only show tiles for jobs that actually exist in the store
  const jobTiles = allJobTiles.filter((t) => !!jobsById[t.jobId]);

  const visibleTiles = jobTiles.slice(0, 4);
  const hasMore = jobTiles.length > 4;

  // ─── Signal section feedback handler ──────────────────────────────────────
  const handleSignalFeedback = (sentiment: 'up' | 'down') => {
    if (feedbackGiven) return;
    setFeedbackGiven(sentiment);

    const isDown = sentiment === 'down';
    const jobTitle = isDown
      ? 'Adjust my signal preferences'
      : 'I want better signals';

    const options: SignalFeedbackOption[] = isDown
      ? [
          { id: 'suppress_intent', label: 'Show fewer intent/topic signals', description: 'Reduce topic-based intent spikes.', scope: 'category', icon: 'tag' },
          { id: 'suppress_dm_changes', label: 'Show fewer decision-maker changes', description: 'Reduce new hire / departure alerts.', scope: 'category', icon: 'building' },
          { id: 'suppress_low_confidence', label: 'Only show high-confidence signals', description: 'Filter out medium/low confidence signals.', scope: 'all', icon: 'bell-off' },
          { id: 'suppress_stale', label: 'Only show signals from the last 48 hours', description: 'Remove older signals.', scope: 'all', icon: 'globe' },
        ]
      : [
          { id: 'boost_intent', label: 'More intent/topic signals', description: 'Prioritize buying intent and topic spike signals.', scope: 'category', icon: 'star' },
          { id: 'boost_people', label: 'More people movement signals', description: 'Prioritize new hires, departures, and role changes.', scope: 'category', icon: 'building' },
          { id: 'boost_engagement', label: 'More engagement signals', description: 'Show engagement with content, campaigns, or pricing pages.', scope: 'category', icon: 'bell' },
          { id: 'boost_pipeline_risk', label: 'More pipeline risk signals', description: 'Surface coverage gaps, stalled deals, and champion risk.', scope: 'category', icon: 'tag' },
        ];

    const feedbackCardData: SignalFeedbackCardData = {
      sentiment: isDown ? 'thumbs_down' : 'thumbs_up',
      signalCardId: 'section_signals',
      signalCategory: 'Signals',
      signalTitle: 'Signals to act on',
      options,
    };

    const seedText = isDown
      ? 'I want to adjust which signals show up in my feed. Some of these aren\'t useful.'
      : 'These signals are helpful. I want to see more like this and tune my preferences.';

    const jobId = createJob({
      title: jobTitle,
      type: 'CONVERSATION',
      kind: 'tracked',
      seedMessage: seedText,
      scope: { territory: 'West SMB' },
    });

    selectJob(jobId);

    setTimeout(() => {
      const agentText = isDown
        ? 'I hear you \u2014 let\u2019s tune your signal feed so it surfaces only what matters. Which types would you like to dial down?'
        : 'Glad these are useful! Let me help you get even more of the good stuff. What types of signals matter most to you?';

      addMessage(jobId, {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        role: 'agent',
        timestamp: new Date().toISOString(),
        content: agentText,
        cardType: 'SIGNAL_FEEDBACK',
        cardData: feedbackCardData,
      });
    }, 600);
  };

  const signalSectionActions = (
    <div className="flex items-center gap-[2px]">
      <button
        onClick={() => handleSignalFeedback('up')}
        disabled={feedbackGiven !== null}
        className={`rounded-[4px] p-[4px] transition-colors ${
          feedbackGiven === 'up'
            ? 'bg-li-blue/10 text-li-blue'
            : feedbackGiven
              ? 'text-li-text-disabled'
              : 'text-li-text-disabled hover:bg-li-bg-hover hover:text-li-text-secondary'
        }`}
        title="These signals are useful \u2014 show me more"
      >
        <ThumbsUp size={13} />
      </button>
      <button
        onClick={() => handleSignalFeedback('down')}
        disabled={feedbackGiven !== null}
        className={`rounded-[4px] p-[4px] transition-colors ${
          feedbackGiven === 'down'
            ? 'bg-amber-50 text-amber-600'
            : feedbackGiven
              ? 'text-li-text-disabled'
              : 'text-li-text-disabled hover:bg-li-bg-hover hover:text-li-text-secondary'
        }`}
        title="These signals aren't useful \u2014 adjust"
      >
        <ThumbsDown size={13} />
      </button>
    </div>
  );

  return (
    <div className="flex h-full flex-col overflow-y-auto li-scrollbar">
      <div
        className="mx-auto flex w-full flex-col gap-[40px] px-[32px] py-[32px]"
        style={{ maxWidth: 'var(--evidence-max-width)' }}
      >
        {/* Section 1: Quick start */}
        <div className="flex flex-col gap-[12px]">
          <SectionHeader
            title="Quick start"
            subtitle="Ask a question, start a workflow, or pick a common starting point."
          />
          <AgentHomeInput placeholders={placeholders} />
          <StartPointChips chips={chips} />
        </div>

        {/* Section 2 + 3: Two-column 50/50 */}
        <div className="grid grid-cols-1 gap-[40px] lg:grid-cols-2">
          {/* Left: Signals to act on */}
          <div className="flex flex-col gap-[16px]">
            <SectionHeader
              title="Signals to act on"
              subtitle="New signals and changes worth acting on right now."
              actions={signalSectionActions}
            />
            <div className="flex flex-col gap-[12px]">
              {signalCards.map((card) => (
                <SignalCardComponent key={card.id} card={card} />
              ))}
            </div>
          </div>

          {/* Right: Jobs that need your attention */}
          <div className="flex flex-col gap-[16px]">
            <SectionHeader
              title={TERMS.PLAYS_NEED_ATTENTION}
              subtitle={TERMS.PLAYS_NEED_ATTENTION_SUB}
            />
            <div className="flex flex-col gap-[10px]">
              {/* Calling Attention tile — shows after play is submitted */}
              {localStorage.getItem('sa.onboarding_completed') === 'true' && (
                <CallingAttentionTile />
              )}
              {visibleTiles.length === 0 && localStorage.getItem('sa.onboarding_completed') !== 'true' && (
                <div className="li-card flex items-center justify-center p-[16px]">
                  <span className="font-body text-ds-small text-li-text-tertiary">
                    Nothing waiting on you right now.
                  </span>
                </div>
              )}
              {visibleTiles.map((tile) => (
                <JobTileComponent key={tile.id} tile={tile} />
              ))}
              {hasMore && (
                <button
                  className="self-start font-body text-ds-small font-semibold text-li-blue hover:underline"
                >
                  {TERMS.SEE_ALL_PLAYS}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Calling Attention Tile ──────────────────────────────────

function CallingAttentionTile() {
  return (
    <div className="li-card flex flex-col gap-[8px] p-[14px] transition-shadow hover:shadow-sm">
      {/* Row 1: Title + count badge */}
      <div className="flex items-center gap-[8px]">
        <span className="flex-1 font-body text-ds-base font-semibold text-li-text-primary leading-snug">
          2 replies received from your outreach
        </span>
        <span className="shrink-0 flex items-center gap-[4px] rounded-[4px] bg-li-blue/10 px-[8px] py-[2px] font-body text-ds-small font-semibold text-li-blue">
          <MessageCircle size={12} />
          2 new
        </span>
      </div>

      {/* Row 2: Details */}
      <p className="font-body text-ds-small text-li-text-secondary leading-relaxed">
        <span className="font-medium text-li-text-primary">Sarah Chen</span> (VP Revenue Ops, Acme) and <span className="font-medium text-li-text-primary">Marcus Rivera</span> (CRO, Nimbus) responded to your connection requests.
      </p>

      {/* Row 3: CTA */}
      <div className="flex items-center justify-end pt-[2px]">
        <button
          onClick={(e) => e.preventDefault()}
          className="flex items-center gap-[4px] rounded-ds-button bg-li-blue px-[14px] py-[5px] font-body text-ds-small font-semibold text-white transition-colors hover:bg-li-blue-dark"
        >
          Review replies
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
