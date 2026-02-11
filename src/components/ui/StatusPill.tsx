import clsx from 'clsx';
import type { JobStatus } from '../../types/common';

const STATUS_LABELS: Record<JobStatus, string> = {
  QUEUED: 'Queued',
  RUNNING: 'Running',
  NEEDS_APPROVAL: 'Needs review',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

interface Props {
  status: JobStatus;
  unseen?: boolean;
  className?: string;
}

export default function StatusPill({ status, unseen, className }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-[4px] rounded-[4px] bg-li-bg-tertiary px-[7px] py-[2px] font-body text-[11px] font-medium text-li-text-secondary',
        className
      )}
    >
      {unseen && (
        <span className="h-[5px] w-[5px] rounded-full bg-li-blue" />
      )}
      {STATUS_LABELS[status]}
    </span>
  );
}
