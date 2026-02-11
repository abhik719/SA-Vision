import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  /** Optional trailing actions rendered inline with the title */
  actions?: ReactNode;
}

export default function SectionHeader({ title, subtitle, actions }: Props) {
  return (
    <div className="flex flex-col gap-[2px]">
      <div className="flex items-center gap-[8px]">
        <h3 className="font-display text-[16px] font-semibold leading-snug text-li-text-primary">
          {title}
        </h3>
        {actions && <div className="flex items-center">{actions}</div>}
      </div>
      {subtitle && (
        <p className="font-body text-[12px] text-li-text-tertiary">
          {subtitle}
        </p>
      )}
    </div>
  );
}
