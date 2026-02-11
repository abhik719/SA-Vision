import { useState } from 'react';
import { Send } from 'lucide-react';

interface Props {
  onSend: (text: string) => void;
}

export function Composer({ onSend }: Props) {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <div
      className="flex shrink-0 items-center gap-[8px] px-[16px] py-[10px]"
      style={{ borderTop: '1px solid var(--border-standard)' }}
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Ask the agent anything..."
        className="flex-1 rounded-ds-card border border-li-border-standard bg-white px-[12px] py-[8px] font-body text-ds-base text-li-text-primary placeholder:text-li-text-disabled focus:border-li-blue focus:outline-none"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim()}
        className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-li-blue text-white transition-colors hover:bg-li-blue-dark disabled:bg-li-tag-bg disabled:text-li-text-disabled"
      >
        <Send size={16} />
      </button>
    </div>
  );
}
