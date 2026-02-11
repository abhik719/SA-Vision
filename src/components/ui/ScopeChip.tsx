import clsx from 'clsx';

interface Props {
  label: string;
  className?: string;
}

export default function ScopeChip({ label, className }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-ds-spotlight bg-li-bg-tertiary px-[8px] py-[2px] font-body text-ds-small text-li-text-tertiary',
        className
      )}
    >
      {label}
    </span>
  );
}
