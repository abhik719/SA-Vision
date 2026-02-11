import { Home, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  contextLabel: string;
}

export default function EvidenceBreadcrumb({ contextLabel }: Props) {
  const goHome = useAppStore((s) => s.goHome);

  return (
    <div className="flex shrink-0 items-center bg-white px-[24px] pt-[12px] pb-[0px]">
      <div className="flex items-center gap-[6px]">
        <button
          onClick={goHome}
          className="flex items-center gap-[4px] rounded-[4px] px-[4px] py-[2px] font-body text-[12px] text-li-text-tertiary transition-colors hover:text-li-blue hover:underline"
        >
          <Home size={12} />
          Agent home
        </button>
        <ChevronRight size={10} className="text-li-text-disabled" />
        <span className="max-w-[280px] truncate font-body text-[12px] font-medium text-li-text-secondary">
          {contextLabel}
        </span>
      </div>
    </div>
  );
}
