import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface AgentSectionProps {
  title: string;
  count: number;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export function AgentSection({ title, count, defaultExpanded = true, children }: AgentSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="flex flex-col">
      <button
        className="flex items-center gap-[4px] px-[16px] py-[6px] text-left font-body text-ds-small font-semibold uppercase tracking-wider text-li-text-tertiary transition-colors hover:text-li-text-secondary"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded
          ? <ChevronDown size={12} className="shrink-0 text-li-text-tertiary" />
          : <ChevronRight size={12} className="shrink-0 text-li-text-tertiary" />
        }
        <span>{title}</span>
        {count > 0 && (
          <span className="ml-[2px] font-body text-[10px] font-normal text-li-text-disabled">
            ({count})
          </span>
        )}
      </button>
      {expanded && <div className="flex flex-col">{children}</div>}
    </div>
  );
}
