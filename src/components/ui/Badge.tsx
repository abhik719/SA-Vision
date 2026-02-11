import clsx from 'clsx';
import type { ThreadType } from '../../types/common';

const BADGE_STYLE = 'bg-li-bg-tertiary text-li-text-tertiary';
const BADGE_STYLES: Record<ThreadType, string> = {
  PRIORITIZE: BADGE_STYLE,
  LEADS: BADGE_STYLE,
  OUTREACH: BADGE_STYLE,
  MIXED: BADGE_STYLE,
};

const BADGE_LABELS: Record<ThreadType, string> = {
  PRIORITIZE: 'Prioritize',
  LEADS: 'Leads',
  OUTREACH: 'Outreach',
  MIXED: 'Mixed',
};

interface Props {
  type: ThreadType;
  className?: string;
}

export default function Badge({ type, className }: Props) {
  // Don't render a badge for unresolved/mixed threads
  if (type === 'MIXED') return null;

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-ds-spotlight px-[8px] py-[2px] font-body text-ds-small',
        BADGE_STYLES[type],
        className
      )}
    >
      {BADGE_LABELS[type]}
    </span>
  );
}
