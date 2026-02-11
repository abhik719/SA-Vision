import { useState } from 'react';
import type { Evidence } from '../../types/evidence';
import type { SignalFeedbackCardData, SignalFeedbackOption } from '../../types/thread';
import { useAppStore } from '../../store/useAppStore';
import { useJobStore } from '../../store/useJobStore';
import AgentHomeInput from './AgentHomeInput';
import StartPointChips from './StartPointChips';
import SectionHeader from './SectionHeader';
import SignalCardComponent from './SignalCardComponent';
import JobTileComponent from './JobTileComponent';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { processSellerMessage } from '../../flows/engine';

interface Props {
  evidence: Evidence;
}

export default function AgentHome({ evidence }: Props) {
  const selectJob = useAppStore((s) => s.selectJob);
  const createJob = useJobStore((s) => s.createJob);
  const addMessage = useJobStore((s) => s.addMessage);
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);

  const placeholders = evidence.inputPlaceholders || [];
  const chips = evidence.chips || [];
  const signalCards = evidence.signalCards || [];
  const jobTiles = evidence.jobTiles || [];

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
              title="Jobs that need your attention"
              subtitle="Jobs, approvals, and follow-ups waiting on you."
            />
            <div className="flex flex-col gap-[10px]">
              {visibleTiles.length === 0 && (
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
                  See all jobs
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
