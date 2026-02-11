import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Evidence } from '../types/evidence';

interface EvidenceState {
  evidenceById: Record<string, Evidence>;

  setEvidenceMap: (evidence: Evidence[]) => void;
  setEvidence: (id: string, data: Evidence) => void;
  updateEvidence: (id: string, partial: Partial<Evidence>) => void;
  getEvidence: (id: string) => Evidence | undefined;
}

export const useEvidenceStore = create<EvidenceState>()(
  persist(
    (set, get) => ({
      evidenceById: {},

      setEvidenceMap: (evidence) => {
        const byId: Record<string, Evidence> = {};
        evidence.forEach((e) => {
          byId[e.id] = e;
        });
        set({ evidenceById: byId });
      },

      setEvidence: (id, data) =>
        set((state) => ({
          evidenceById: { ...state.evidenceById, [id]: data },
        })),

      updateEvidence: (id, partial) =>
        set((state) => {
          const existing = state.evidenceById[id];
          if (!existing) return state;
          return {
            evidenceById: {
              ...state.evidenceById,
              [id]: { ...existing, ...partial },
            },
          };
        }),

      getEvidence: (id) => get().evidenceById[id],
    }),
    { name: 'sa-agent-evidence' }
  )
);
