import clsx from 'clsx';
import type { JobStatus } from '../../types/common';

const STATUS_CONFIG: Record<JobStatus, { label: string; dot?: string; bg?: string; text?: string }> = {
  NEW:             { label: 'New',              dot: 'bg-li-blue' },
  QUEUED:          { label: 'Queued',           dot: 'bg-amber-500' },
  SCHEDULED:       { label: 'Scheduled',        dot: 'bg-violet-500' },
  NEEDS_INPUT:     { label: 'Input required',   dot: 'bg-orange-500' },
  RUNNING:         { label: 'Running',          dot: 'bg-green-500' },
  READY_TO_REVIEW: { label: 'Ready for review', dot: 'bg-li-blue' },
  ARCHIVED:        { label: 'Archived' },
};

interface Props {
  status: JobStatus;
  unseen?: boolean;
  className?: string;
}

export default function StatusPill({ status, unseen, className }: Props) {
  const config = STATUS_CONFIG[status] || { label: status || 'Unknown' };
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-[4px] rounded-[4px] bg-li-bg-tertiary px-[7px] py-[2px] font-body text-ds-small font-semibold text-li-text-secondary',
        className
      )}
    >
      {(unseen || config.dot) && (
        <span className={clsx('h-[5px] w-[5px] rounded-full', unseen ? 'bg-li-blue' : config.dot)} />
      )}
      {config.label}
    </span>
  );
}
