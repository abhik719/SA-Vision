import clsx from 'clsx';

interface Props {
  signal: string;
  className?: string;
  /** Max width before truncation (default: 180px) */
  maxWidth?: number;
}

export default function SignalPill({ signal, className, maxWidth = 180 }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center truncate rounded-ds-tag bg-li-bg-tertiary px-[6px] py-[1px] font-body text-[12px] text-li-text-tertiary',
        className
      )}
      style={{ maxWidth }}
      title={signal}
    >
      {signal}
    </span>
  );
}
