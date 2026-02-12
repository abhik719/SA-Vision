import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SelectedView } from '../types/common';

interface AppState {
  selectedView: SelectedView;
  selectedJobId: string | null;
  currentEvidenceId: string | null;
  /** Tracks the highest play step the user has actually reached (0-indexed) */
  playProgressStep: number;
  /** Job ID for which the recurrence dialog is open (null = closed) */
  recurrenceDialogJobId: string | null;

  selectJob: (jobId: string | null) => void;
  setCurrentEvidence: (evidenceId: string | null) => void;
  /** Advance the play progress to the given step (only ratchets upward) */
  advancePlayProgress: (step: number) => void;
  goHome: () => void;
  goOnboarding: () => void;
  openRecurrenceDialog: (jobId: string) => void;
  closeRecurrenceDialog: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedView: 'HOME',
      selectedJobId: null,
      currentEvidenceId: 'ev_home',
      playProgressStep: 0,
      recurrenceDialogJobId: null,

      selectJob: (jobId) =>
        set({
          selectedJobId: jobId,
          selectedView: jobId ? 'JOB' : 'HOME',
          currentEvidenceId: jobId ? null : 'ev_home',
        }),

      setCurrentEvidence: (evidenceId) =>
        set({ currentEvidenceId: evidenceId }),

      advancePlayProgress: (step) =>
        set((state) => ({
          playProgressStep: Math.max(state.playProgressStep, step),
        })),

      goHome: () =>
        set({
          selectedView: 'HOME',
          selectedJobId: null,
          currentEvidenceId: 'ev_home',
        }),

      goOnboarding: () =>
        set({
          selectedView: 'ONBOARDING',
          selectedJobId: null,
          currentEvidenceId: null,
        }),

      openRecurrenceDialog: (jobId) =>
        set({ recurrenceDialogJobId: jobId }),

      closeRecurrenceDialog: () =>
        set({ recurrenceDialogJobId: null }),
    }),
    { name: 'sa-agent-app-v2' }
  )
);
