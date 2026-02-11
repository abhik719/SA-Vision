import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useThreadStore } from '../store/useThreadStore';
import { processSellerMessage } from '../flows/engine';

/**
 * Hook that creates a new thread from a prompt, selects it,
 * and triggers the scripted agent response.
 */
export function useCreateThreadFromPrompt() {
  const selectThread = useAppStore((s) => s.selectThread);
  const createThread = useThreadStore((s) => s.createThread);

  return useCallback(
    (prompt: string) => {
      const title =
        prompt.length > 50 ? prompt.slice(0, 47) + '...' : prompt;
      const threadId = createThread({
        title,
        type: 'MIXED',
        seedMessage: prompt,
        scope: { territory: 'West SMB' },
      });
      selectThread(threadId);
      setTimeout(() => processSellerMessage(threadId, prompt), 100);
    },
    [selectThread, createThread]
  );
}
