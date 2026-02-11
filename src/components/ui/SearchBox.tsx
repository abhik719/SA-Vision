import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function SearchBox({
  value,
  onChange,
  placeholder = 'Search...',
}: Props) {
  return (
    <div className="relative flex items-center">
      <Search
        size={16}
        className="absolute left-[8px]"
        style={{ color: 'rgba(0,0,0,0.6)' }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-ds-card border border-li-border-standard bg-li-bg-secondary py-[6px] pl-[28px] pr-[28px] font-body text-ds-base text-li-text-primary placeholder:text-li-text-disabled focus:border-li-blue focus:outline-none"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-[8px] rounded-full p-[2px] hover:bg-li-bg-hover"
        >
          <X size={14} style={{ color: 'rgba(0,0,0,0.6)' }} />
        </button>
      )}
    </div>
  );
}
