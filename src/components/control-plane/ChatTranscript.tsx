import { useRef, useEffect, useMemo } from 'react';
import type { Job } from '../../types/job';
import ChatMessage from './ChatMessage';

interface Props {
  job: Job;
}

export function ChatTranscript({ job }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [job.messages.length]);

  // Find the last agent message index (for interactive chips)
  const lastAgentMsgId = useMemo(() => {
    for (let i = job.messages.length - 1; i >= 0; i--) {
      if (job.messages[i].role === 'agent' && job.messages[i].suggestedChips?.length) {
        return job.messages[i].id;
      }
    }
    return null;
  }, [job.messages]);

  return (
    <div className="flex flex-col">
      {job.messages.map((msg) => (
        <ChatMessage
          key={msg.id}
          message={msg}
          jobId={job.id}
          isLastAgentMessage={msg.id === lastAgentMsgId}
        />
      ))}
      <div ref={endRef} />
    </div>
  );
}

export default ChatTranscript;
