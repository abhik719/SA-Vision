import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useJobStore } from '../store/useJobStore';
import { processSellerMessage } from '../flows/engine';

/**
 * Hook that creates a new conversation job from a prompt, selects it,
 * and triggers the scripted agent response.
 */
export function useCreateJobFromPrompt() {
  const selectJob = useAppStore((s) => s.selectJob);
  const createJob = useJobStore((s) => s.createJob);

  return useCallback(
    (prompt: string) => {
      const title =
        prompt.length > 50 ? prompt.slice(0, 47) + '...' : prompt;
      const jobId = createJob({
        title,
        type: 'CONVERSATION',
        kind: 'tracked',
        seedMessage: prompt,
        scope: { territory: 'West SMB' },
      });
      selectJob(jobId);
      setTimeout(() => processSellerMessage(jobId, prompt), 100);
    },
    [selectJob, createJob]
  );
}
