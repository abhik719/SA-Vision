import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SelectedView } from '../types/common';

interface AppState {
  selectedView: SelectedView;
  selectedJobId: string | null;
  currentEvidenceId: string | null;

  selectJob: (jobId: string | null) => void;
  setCurrentEvidence: (evidenceId: string | null) => void;
  goHome: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedView: 'HOME',
      selectedJobId: null,
      currentEvidenceId: 'ev_home',

      selectJob: (jobId) =>
        set({
          selectedJobId: jobId,
          selectedView: jobId ? 'JOB' : 'HOME',
          currentEvidenceId: jobId ? null : 'ev_home',
        }),

      setCurrentEvidence: (evidenceId) =>
        set({ currentEvidenceId: evidenceId }),

      goHome: () =>
        set({
          selectedView: 'HOME',
          selectedJobId: null,
          currentEvidenceId: 'ev_home',
        }),
    }),
    { name: 'sa-agent-app-v2' }
  )
);
