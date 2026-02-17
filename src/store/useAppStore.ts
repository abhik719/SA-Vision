import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SelectedView } from '../types/common';

export interface ToastMessage {
  id: string;
  text: string;
  subtext?: string;
  durationMs: number;
}

interface AppState {
  selectedView: SelectedView;
  selectedJobId: string | null;
  currentEvidenceId: string | null;
  /** Tracks the highest play step the user has actually reached (0-indexed) */
  playProgressStep: number;
  /** Job ID for which the recurrence dialog is open (null = closed) */
  recurrenceDialogJobId: string | null;
  /** Active toast message (null = hidden) */
  toast: ToastMessage | null;

  selectJob: (jobId: string | null) => void;
  setCurrentEvidence: (evidenceId: string | null) => void;
  /** Advance the play progress to the given step (only ratchets upward) */
  advancePlayProgress: (step: number) => void;
  goHome: () => void;
  goOnboarding: () => void;
  openRecurrenceDialog: (jobId: string) => void;
  closeRecurrenceDialog: () => void;
  showToast: (text: string, subtext?: string, durationMs?: number) => void;
  dismissToast: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedView: 'HOME',
      selectedJobId: null,
      currentEvidenceId: 'ev_home',
      playProgressStep: 0,
      recurrenceDialogJobId: null,
      toast: null,

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

      showToast: (text, subtext, durationMs = 2500) =>
        set({
          toast: {
            id: `toast_${Date.now()}`,
            text,
            subtext,
            durationMs,
          },
        }),

      dismissToast: () => set({ toast: null }),
    }),
    {
      name: 'sa-agent-app-v2',
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { toast, ...rest } = state;
        return rest;
      },
    }
  )
);
