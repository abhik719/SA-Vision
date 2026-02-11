import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Mic } from 'lucide-react';
import { useCreateJobFromPrompt } from '../../hooks/useCreateJobFromPrompt';

interface Props {
  placeholders: string[];
}

export default function AgentHomeInput({ placeholders }: Props) {
  const [text, setText] = useState('');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const createFromPrompt = useCreateJobFromPrompt();
  const inputRef = useRef<HTMLInputElement>(null);

  // Rotate placeholder every 4 seconds
  useEffect(() => {
    if (placeholders.length <= 1) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
        setFade(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    createFromPrompt(trimmed);
    setText('');
  };

  return (
    <div className="flex flex-col gap-[8px]">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={placeholders[placeholderIdx]}
          className={`w-full rounded-[12px] border border-li-border-standard bg-white py-[14px] pl-[16px] pr-[124px] font-body text-ds-base text-li-text-primary shadow-sm transition-all placeholder:transition-opacity placeholder:duration-300 focus:border-li-blue focus:shadow-md focus:outline-none ${
            fade ? 'placeholder:opacity-60' : 'placeholder:opacity-0'
          }`}
        />
        <div className="absolute right-[8px] flex items-center gap-[4px]">
          <button
            className="rounded-full p-[8px] text-li-text-disabled hover:bg-li-bg-hover hover:text-li-text-tertiary"
            title="Attach (coming soon)"
          >
            <Paperclip size={16} />
          </button>
          <button
            className="rounded-full p-[8px] text-li-text-disabled hover:bg-li-bg-hover hover:text-li-text-tertiary"
            title="Voice input (coming soon)"
          >
            <Mic size={16} />
          </button>
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-li-blue text-white transition-colors hover:bg-li-blue-dark disabled:bg-li-tag-bg disabled:text-li-text-disabled"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
