import type { AgentHomeChip } from '../../types/evidence';
import { useCreateJobFromPrompt } from '../../hooks/useCreateJobFromPrompt';

interface Props {
  chips: AgentHomeChip[];
}

export default function StartPointChips({ chips }: Props) {
  const createFromPrompt = useCreateJobFromPrompt();

  return (
    <div className="flex flex-wrap gap-[6px]">
      {chips.map((chip) => (
        <button
          key={chip.id}
          onClick={() => createFromPrompt(chip.seedPrompt)}
          className="rounded-ds-spotlight border border-li-border-standard px-[10px] py-[3px] font-body text-ds-small text-li-text-tertiary transition-colors hover:bg-li-bg-hover hover:text-li-text-secondary"
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
