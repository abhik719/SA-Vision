import type { SignalCard, SignalCtaAction } from '../../types/evidence';
import { useCreateThreadFromPrompt } from '../../hooks/useCreateThreadFromPrompt';
import { useAppStore } from '../../store/useAppStore';
import { useThreadStore } from '../../store/useThreadStore';
import { useEvidenceStore } from '../../store/useEvidenceStore';
import { processSellerMessage } from '../../flows/engine';
import Button from '../ui/Button';
import LogoPile from '../ui/LogoPile';
import {
  ArrowRight,
  Search,
  FileText,
  Play,
} from 'lucide-react';

const ACTION_ICONS: Record<string, typeof Search> = {
  FIND_PEOPLE: Search,
  CREATE_OUTREACH: FileText,
  INTERNAL_ACTION: Play,
};

interface Props {
  card: SignalCard;
}

export default function SignalCardComponent({ card }: Props) {
  const createFromPrompt = useCreateThreadFromPrompt();
  const selectThread = useAppStore((s) => s.selectThread);
  const setCurrentEvidence = useAppStore((s) => s.setCurrentEvidence);
  const createThread = useThreadStore((s) => s.createThread);
  const setEvidence = useEvidenceStore((s) => s.setEvidence);

  // Build logo pile from account entities
  const accountEntities = card.entities.filter((e) => e.type === 'account');
  const logopileItems = accountEntities.map((e) => ({ id: e.id, name: e.name, logoUrl: e.logoUrl }));

  // Map known signal cards to existing threads for demo determinism
  const SIGNAL_THREAD_MAP: Record<string, string> = {
    'sig_card_intent_01': 'th_intent_crm_modernization',
  };

  const handleCta = (cta: SignalCtaAction) => {
    // Check if this signal maps to an existing thread
    const existingThreadId = SIGNAL_THREAD_MAP[card.id];
    if (existingThreadId) {
      selectThread(existingThreadId);
      return;
    }
    const prompts: Record<string, string> = {
      FIND_PEOPLE: `Find people: ${cta.label}`,
      CREATE_OUTREACH: `Draft outreach: ${cta.label}`,
      INTERNAL_ACTION: `Run job: ${cta.label}`,
    };
    createFromPrompt(prompts[cta.actionType] || cta.label);
  };

  const handleLearnMore = () => {
    // Create a SIGNAL_DETAIL evidence object
    const evidenceId = `ev_signal_${card.id}`;
    setEvidence(evidenceId, {
      id: evidenceId,
      type: 'SIGNAL_DETAIL',
      title: card.title,
      subtitle: card.whyNow,
      generatedAt: new Date().toISOString(),
      signalCard: card,
    });

    // Create a thread for this signal
    const threadId = createThread({
      title: card.title,
      type: 'MIXED',
      seedMessage: `Tell me more about: ${card.title}`,
      scope: { territory: 'West SMB' },
    });

    selectThread(threadId);
    setCurrentEvidence(evidenceId);
    setTimeout(() => processSellerMessage(threadId, `Tell me more about: ${card.title}`), 100);
  };

  // Meta line
  const metaParts: string[] = [];
  if (card.meta.entities === 1 && card.meta.leads) {
    metaParts.push(`1 account \u2022 ${card.meta.leads} leads`);
  } else if (card.meta.entities > 1) {
    metaParts.push(`${card.meta.entities} accounts`);
  } else {
    metaParts.push('1 account');
  }
  metaParts.push(card.meta.updated);
  const metaLine = metaParts.join(' \u2022 ');

  return (
    <div className="li-card flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-[8px] p-[16px]">
        {/* Category + meta row */}
        <div className="flex items-center justify-between">
          <span className="font-body text-[10px] font-semibold uppercase tracking-wider text-li-text-tertiary">
            {card.category}
          </span>
          <span className="font-body text-[11px] text-li-text-tertiary">{metaLine}</span>
        </div>

        {/* Title + logo pile */}
        <div className="-mt-[4px] flex items-center gap-[8px]">
          <h4 className="flex-1 font-body text-ds-base font-semibold text-li-text-primary leading-snug">
            {card.title}
          </h4>
          {logopileItems.length > 0 && <LogoPile items={logopileItems} max={3} size="sm" />}
        </div>

        {/* Why now */}
        <p className="-mt-[4px] font-body text-ds-small text-li-text-secondary leading-relaxed">
          {card.whyNow}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-[6px] pt-[2px]">
          <CtaButton cta={card.primaryCta} variant="primary" onClick={() => handleCta(card.primaryCta)} />
          <CtaButton cta={card.secondaryCta} variant="ghost" onClick={() => handleCta(card.secondaryCta)} />
          <button
            onClick={handleLearnMore}
            className="ml-auto flex items-center gap-[3px] rounded px-[6px] py-[2px] font-body text-[11px] text-li-text-tertiary hover:text-li-blue hover:underline"
          >
            Learn more
            <ArrowRight size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Thin CTA button with action-type icon */
function CtaButton({
  cta,
  variant,
  onClick,
}: {
  cta: SignalCtaAction;
  variant: 'primary' | 'ghost';
  onClick: () => void;
}) {
  const ActionIcon = ACTION_ICONS[cta.actionType] || Play;
  return (
    <Button size="sm" variant={variant} onClick={onClick}>
      <ActionIcon size={11} className="mr-[3px] shrink-0" />
      <span className="truncate">{cta.label}</span>
    </Button>
  );
}
