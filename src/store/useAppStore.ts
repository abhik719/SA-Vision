import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ActiveTab, SelectedView } from '../types/common';

interface AppState {
  selectedView: SelectedView;
  activeTab: ActiveTab;
  selectedThreadId: string | null;
  selectedJobId: string | null;
  currentEvidenceId: string | null;

  setSelectedView: (view: SelectedView) => void;
  setActiveTab: (tab: ActiveTab) => void;
  selectThread: (threadId: string | null) => void;
  selectJob: (jobId: string | null) => void;
  setCurrentEvidence: (evidenceId: string | null) => void;
  goHome: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedView: 'HOME',
      activeTab: 'THREADS',
      selectedThreadId: null,
      selectedJobId: null,
      currentEvidenceId: 'ev_home',

      setSelectedView: (view) => set({ selectedView: view }),
      setActiveTab: (tab) => set({ activeTab: tab }),

      selectThread: (threadId) =>
        set({
          selectedThreadId: threadId,
          selectedView: threadId ? 'THREAD' : 'HOME',
          currentEvidenceId: threadId ? null : 'ev_home',
        }),

      selectJob: (jobId) =>
        set({
          selectedJobId: jobId,
          selectedView: jobId ? 'JOB' : 'HOME',
          activeTab: 'JOBS',
        }),

      setCurrentEvidence: (evidenceId) =>
        set({ currentEvidenceId: evidenceId }),

      goHome: () =>
        set({
          selectedView: 'HOME',
          selectedThreadId: null,
          selectedJobId: null,
          currentEvidenceId: 'ev_home',
          activeTab: 'THREADS',
        }),
    }),
    { name: 'sa-agent-app' }
  )
);
