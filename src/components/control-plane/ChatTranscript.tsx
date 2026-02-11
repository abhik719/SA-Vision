import { useRef, useEffect } from 'react';
import type { Thread } from '../../types/thread';
import ChatMessage from './ChatMessage';

interface Props {
  thread: Thread;
}

export default function ChatTranscript({ thread }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.messages.length]);

  return (
    <div className="flex-1 overflow-y-auto li-scrollbar">
      {thread.messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} threadId={thread.id} />
      ))}
      <div ref={endRef} />
    </div>
  );
}
