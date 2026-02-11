import type { Evidence, SignalCtaAction } from '../../types/evidence';
import { useCreateThreadFromPrompt } from '../../hooks/useCreateThreadFromPrompt';
import Button from '../ui/Button';
import Facepile from '../ui/Facepile';
import LogoPile from '../ui/LogoPile';
import { Search, FileText, Play } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  'Intent': '#0A66C2',
  'Decision maker change': '#2F7B15',
  'Pipeline risk': '#C37D16',
  'Engagement intent': '#9333EA',
};

const ACTION_ICONS: Record<string, typeof Search> = {
  FIND_PEOPLE: Search,
  CREATE_OUTREACH: FileText,
  INTERNAL_ACTION: Play,
};

interface Props {
  evidence: Evidence;
}

export default function SignalDetail({ evidence }: Props) {
  const card = evidence.signalCard;
  const createFromPrompt = useCreateThreadFromPrompt();

  if (!card) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="font-body text-ds-base text-li-text-tertiary">No signal data</span>
      </div>
    );
  }

  const iconColor = CATEGORY_COLORS[card.category] || '#0A66C2';

  const accountEntities = card.entities.filter((e) => e.type === 'account');
  const logopileItems = accountEntities.map((e) => ({ id: e.id, name: e.name, logoUrl: e.logoUrl }));
  const facepileItems = (card.preview.targets || []).map((t) => ({ id: t.id, name: t.name, avatarUrl: t.avatarUrl }));

  const handleCta = (cta: SignalCtaAction) => {
    const prompts: Record<string, string> = {
      FIND_PEOPLE: `Find people: ${cta.label}`,
      CREATE_OUTREACH: `Draft outreach: ${cta.label}`,
      INTERNAL_ACTION: `Run job: ${cta.label}`,
    };
    createFromPrompt(prompts[cta.actionType] || cta.label);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto li-scrollbar" style={{ padding: 'var(--evidence-padding-top) var(--evidence-padding-x) var(--evidence-padding-bottom)' }}>
      <div className="flex w-full max-w-[720px] flex-col gap-[20px]">
        {/* Category */}
        <span
          className="font-body text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: iconColor }}
        >
          {card.category}
        </span>

        {/* Title + logos */}
        <div className="-mt-[12px] flex items-start gap-[12px]">
          <h2 className="flex-1 font-display text-ds-heading font-semibold text-li-text-primary leading-snug">
            {card.title}
          </h2>
          {logopileItems.length > 0 && <LogoPile items={logopileItems} max={4} size="md" />}
        </div>

        {/* Why now */}
        <p className="font-body text-ds-base text-li-text-secondary leading-relaxed">
          {card.whyNow}
        </p>

        {/* Evidence section */}
        {card.preview.evidence.length > 0 && (
          <div className="li-card flex flex-col gap-[8px] p-[16px]">
            <h3 className="font-body text-ds-small font-semibold uppercase tracking-wider text-li-text-tertiary">
              What we're seeing
            </h3>
            {card.preview.evidence.map((ev, i) => (
              <div key={i} className="flex items-baseline gap-[8px]">
                <span className="shrink-0 font-body text-ds-small font-semibold text-li-text-primary">
                  {ev.label}:
                </span>
                <span className="font-body text-ds-small text-li-text-secondary">{ev.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Targets section */}
        {facepileItems.length > 0 && (
          <div className="li-card flex flex-col gap-[10px] p-[16px]">
            <h3 className="font-body text-ds-small font-semibold uppercase tracking-wider text-li-text-tertiary">
              Suggested targets
            </h3>
            <div className="flex items-center gap-[12px]">
              <Facepile items={facepileItems} max={4} size="md" />
            </div>
            <div className="flex flex-col gap-[6px]">
              {(card.preview.targets || []).map((t) => (
                <div key={t.id} className="flex items-center gap-[8px]">
                  <div className="flex flex-col">
                    <span className="font-body text-ds-base font-semibold text-li-text-primary">
                      {t.name}
                    </span>
                    <span className="font-body text-ds-small text-li-text-secondary">
                      {t.title}
                      {t.degree && (
                        <span className="ml-[4px] text-li-text-tertiary">· {t.degree}</span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation */}
        {card.preview.recommendation && (
          <div className="rounded-ds-card bg-li-bg-tertiary px-[16px] py-[12px]">
            <span className="font-body text-ds-small font-semibold text-li-text-primary">
              Recommended:{' '}
            </span>
            <span className="font-body text-ds-small text-li-text-secondary">
              {card.preview.recommendation}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-[10px] border-t border-li-border-standard pt-[16px]">
          <ActionButton cta={card.primaryCta} variant="primary" onClick={() => handleCta(card.primaryCta)} />
          <ActionButton cta={card.secondaryCta} variant="secondary" onClick={() => handleCta(card.secondaryCta)} />
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  cta,
  variant,
  onClick,
}: {
  cta: SignalCtaAction;
  variant: 'primary' | 'secondary';
  onClick: () => void;
}) {
  const ActionIcon = ACTION_ICONS[cta.actionType] || Play;
  return (
    <Button variant={variant} onClick={onClick}>
      <ActionIcon size={14} className="mr-[6px] shrink-0" />
      {cta.label}
    </Button>
  );
}
