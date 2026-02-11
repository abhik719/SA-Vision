import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

const MIN_LEFT = 280;
const MIN_RIGHT = 520;
const STORAGE_KEY = 'sa-split-width';

interface Props {
  left: ReactNode;
  right: ReactNode;
}

export default function ResizableSplit({ left, right }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 380;
  });
  const dragging = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalWidth = rect.width;
      let newLeft = e.clientX - rect.left;
      newLeft = Math.max(MIN_LEFT, Math.min(newLeft, totalWidth - MIN_RIGHT));
      setLeftWidth(newLeft);
    };
    const onMouseUp = () => {
      if (dragging.current) {
        dragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(leftWidth));
  }, [leftWidth]);

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden">
      {/* Left panel — single right divider, no doubled border */}
      <div
        className="flex h-full shrink-0 flex-col overflow-hidden bg-white"
        style={{
          width: leftWidth,
          borderRight: '1px solid var(--border-standard)',
        }}
      >
        {left}
      </div>

      {/* Drag handle — sits in the gutter between rail and evidence pane */}
      <div
        className="group relative z-10 flex w-[6px] shrink-0 cursor-col-resize items-center justify-center hover:bg-li-blue/10"
        onMouseDown={onMouseDown}
        role="separator"
        aria-orientation="vertical"
        tabIndex={0}
      >
        <div className="h-8 w-[3px] rounded-full bg-transparent group-hover:bg-li-blue/40" />
      </div>

      {/* Right panel — no left border (left rail owns the divider), gutter via padding */}
      <div
        className="flex h-full min-w-0 flex-1 flex-col overflow-hidden"
        style={{ background: 'var(--background-secondary)' }}
      >
        {right}
      </div>
    </div>
  );
}
