import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FeedbackSentiment = 'thumbs_up' | 'thumbs_down';

export interface SignalPreference {
  id: string;
  /** What the user reacted to */
  signalCardId: string;
  signalCategory: string;       // e.g. "Intent", "Decision maker change"
  signalTitle: string;
  accountId?: string;
  accountName?: string;
  /** What they chose */
  sentiment: FeedbackSentiment;
  /** Scope of the preference */
  scope: 'all' | 'category' | 'account' | 'specific';
  /** Human-readable summary */
  label: string;
  createdAt: string;
}

interface SignalPrefsState {
  preferences: SignalPreference[];
  /** Quick lookup: is a specific signal suppressed? */
  isSuppressed: (signalCardId: string) => boolean;
  /** Quick lookup: is an entire category suppressed? */
  isCategorySuppressed: (category: string) => boolean;
  /** Add a preference from feedback */
  addPreference: (pref: SignalPreference) => void;
  /** Remove a preference */
  removePreference: (id: string) => void;
  /** Clear all */
  clearAll: () => void;
}

export const useSignalPrefsStore = create<SignalPrefsState>()(
  persist(
    (set, get) => ({
      preferences: [],

      isSuppressed: (signalCardId) => {
        const prefs = get().preferences;
        return prefs.some(
          (p) =>
            p.sentiment === 'thumbs_down' &&
            (p.scope === 'specific' && p.signalCardId === signalCardId)
        );
      },

      isCategorySuppressed: (category) => {
        const prefs = get().preferences;
        return prefs.some(
          (p) =>
            p.sentiment === 'thumbs_down' &&
            (p.scope === 'all' || p.scope === 'category') &&
            p.signalCategory === category
        );
      },

      addPreference: (pref) =>
        set((state) => ({
          preferences: [...state.preferences, pref],
        })),

      removePreference: (id) =>
        set((state) => ({
          preferences: state.preferences.filter((p) => p.id !== id),
        })),

      clearAll: () => set({ preferences: [] }),
    }),
    { name: 'sa-agent-signal-prefs' }
  )
);
