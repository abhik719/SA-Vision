import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Section {
  id: string;
  label: string;
  /** Sort position — lower = higher in list */
  order: number;
}

interface SectionState {
  sections: Section[];
  /** Which sections are collapsed (id → true means collapsed) */
  collapsed: Record<string, boolean>;

  addSection: (label: string) => string;
  renameSection: (id: string, label: string) => void;
  deleteSection: (id: string) => void;
  reorderSection: (id: string, newOrder: number) => void;
  moveSectionUp: (id: string) => void;
  moveSectionDown: (id: string) => void;
  toggleCollapsed: (id: string) => void;
  setCollapsed: (id: string, value: boolean) => void;
}

let sectionCounter = 0;

export const useSectionStore = create<SectionState>()(
  persist(
    (set) => ({
      sections: [],
      collapsed: {},

      addSection: (label) => {
        const id = `sec_${Date.now()}_${++sectionCounter}`;
        set((state) => ({
          sections: [
            ...state.sections,
            { id, label, order: state.sections.length },
          ],
        }));
        return id;
      },

      renameSection: (id, label) =>
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === id ? { ...s, label } : s
          ),
        })),

      deleteSection: (id) =>
        set((state) => ({
          sections: state.sections.filter((s) => s.id !== id),
          collapsed: (() => {
            const { [id]: _, ...rest } = state.collapsed;
            return rest;
          })(),
        })),

      reorderSection: (id, newOrder) =>
        set((state) => ({
          sections: state.sections
            .map((s) => (s.id === id ? { ...s, order: newOrder } : s))
            .sort((a, b) => a.order - b.order),
        })),

      moveSectionUp: (id) =>
        set((state) => {
          const sorted = [...state.sections].sort((a, b) => a.order - b.order);
          const idx = sorted.findIndex((s) => s.id === id);
          if (idx <= 0) return state;
          // Swap orders with the item above
          const above = sorted[idx - 1];
          const current = sorted[idx];
          return {
            sections: state.sections
              .map((s) => {
                if (s.id === current.id) return { ...s, order: above.order };
                if (s.id === above.id) return { ...s, order: current.order };
                return s;
              })
              .sort((a, b) => a.order - b.order),
          };
        }),

      moveSectionDown: (id) =>
        set((state) => {
          const sorted = [...state.sections].sort((a, b) => a.order - b.order);
          const idx = sorted.findIndex((s) => s.id === id);
          if (idx < 0 || idx >= sorted.length - 1) return state;
          // Swap orders with the item below
          const below = sorted[idx + 1];
          const current = sorted[idx];
          return {
            sections: state.sections
              .map((s) => {
                if (s.id === current.id) return { ...s, order: below.order };
                if (s.id === below.id) return { ...s, order: current.order };
                return s;
              })
              .sort((a, b) => a.order - b.order),
          };
        }),

      toggleCollapsed: (id) =>
        set((state) => ({
          collapsed: { ...state.collapsed, [id]: !state.collapsed[id] },
        })),

      setCollapsed: (id, value) =>
        set((state) => ({
          collapsed: { ...state.collapsed, [id]: value },
        })),
    }),
    { name: 'sa-agent-sections' }
  )
);
