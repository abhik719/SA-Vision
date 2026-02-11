import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  OutreachLead,
  LeadList,
  OutreachPlan,
  OutreachStep,
  OutreachDraft,
  LeadExecutionState,
  ExecutionEvent,
  ExecStatus,
} from '../types/outreach';

interface ExecutionData {
  byLead: LeadExecutionState[];
  events: ExecutionEvent[];
}

interface OutreachState {
  leadListsById: Record<string, LeadList>;
  leadsById: Record<string, OutreachLead>;
  /** Outreach plans keyed by jobId */
  outreachPlansById: Record<string, OutreachPlan>;
  /** Outreach drafts keyed by draftId */
  draftsById: Record<string, OutreachDraft>;
  /** Execution state keyed by jobId */
  executionByJobId: Record<string, ExecutionData>;

  // Lead list actions
  setLeadLists: (lists: LeadList[]) => void;
  getLeadList: (id: string) => LeadList | undefined;

  // Lead actions
  setLeads: (leads: OutreachLead[]) => void;
  getLead: (id: string) => OutreachLead | undefined;
  getLeadsForList: (listId: string) => OutreachLead[];

  // Plan actions
  setPlan: (jobId: string, plan: OutreachPlan) => void;
  getPlan: (jobId: string) => OutreachPlan | undefined;
  updateStep: (jobId: string, stepId: string, updates: Partial<OutreachStep>) => void;
  addStep: (jobId: string, step: OutreachStep) => void;
  removeStep: (jobId: string, stepId: string) => void;
  reorderStep: (jobId: string, stepId: string, direction: 'up' | 'down') => void;

  // Draft actions
  setDrafts: (drafts: OutreachDraft[]) => void;
  getDraftsForJob: (jobId: string, plan: OutreachPlan) => OutreachDraft[];
  updateDraftStatus: (draftId: string, status: OutreachDraft['status']) => void;
  updateDraftBody: (draftId: string, body: string) => void;
  updateDraftSubject: (draftId: string, subject: string) => void;
  approveAllDrafts: () => void;

  // Execution actions
  setExecution: (jobId: string, data: ExecutionData) => void;
  addEvent: (jobId: string, event: ExecutionEvent) => void;
  updateLeadExecStatus: (jobId: string, leadId: string, status: ExecStatus, nextActionAt?: string | null) => void;
  advanceLeadStep: (jobId: string, leadId: string, newStepId: string) => void;
}

export const useOutreachStore = create<OutreachState>()(
  persist(
    (set, get) => ({
      leadListsById: {},
      leadsById: {},
      outreachPlansById: {},
      draftsById: {},
      executionByJobId: {},

      // ── Lead lists ──
      setLeadLists: (lists) => {
        const byId: Record<string, LeadList> = {};
        lists.forEach((l) => { byId[l.id] = l; });
        set({ leadListsById: byId });
      },
      getLeadList: (id) => get().leadListsById[id],

      // ── Leads ──
      setLeads: (leads) => {
        const byId: Record<string, OutreachLead> = {};
        leads.forEach((l) => { byId[l.id] = l; });
        set({ leadsById: byId });
      },
      getLead: (id) => get().leadsById[id],
      getLeadsForList: (listId) => {
        const list = get().leadListsById[listId];
        if (!list) return [];
        return list.leadIds.map((lid) => get().leadsById[lid]).filter(Boolean);
      },

      // ── Plans ──
      setPlan: (jobId, plan) =>
        set((s) => ({
          outreachPlansById: { ...s.outreachPlansById, [jobId]: plan },
        })),
      getPlan: (jobId) => get().outreachPlansById[jobId],
      updateStep: (jobId, stepId, updates) =>
        set((s) => {
          const plan = s.outreachPlansById[jobId];
          if (!plan) return s;
          return {
            outreachPlansById: {
              ...s.outreachPlansById,
              [jobId]: {
                ...plan,
                steps: plan.steps.map((st) =>
                  st.id === stepId ? { ...st, ...updates } : st
                ),
              },
            },
          };
        }),
      addStep: (jobId, step) =>
        set((s) => {
          const plan = s.outreachPlansById[jobId];
          if (!plan) return s;
          return {
            outreachPlansById: {
              ...s.outreachPlansById,
              [jobId]: { ...plan, steps: [...plan.steps, step] },
            },
          };
        }),
      removeStep: (jobId, stepId) =>
        set((s) => {
          const plan = s.outreachPlansById[jobId];
          if (!plan) return s;
          return {
            outreachPlansById: {
              ...s.outreachPlansById,
              [jobId]: {
                ...plan,
                steps: plan.steps.filter((st) => st.id !== stepId),
              },
            },
          };
        }),
      reorderStep: (jobId, stepId, direction) =>
        set((s) => {
          const plan = s.outreachPlansById[jobId];
          if (!plan) return s;
          const idx = plan.steps.findIndex((st) => st.id === stepId);
          if (idx === -1) return s;
          const newIdx = direction === 'up' ? idx - 1 : idx + 1;
          if (newIdx < 0 || newIdx >= plan.steps.length) return s;
          const steps = [...plan.steps];
          [steps[idx], steps[newIdx]] = [steps[newIdx], steps[idx]];
          return {
            outreachPlansById: {
              ...s.outreachPlansById,
              [jobId]: { ...plan, steps },
            },
          };
        }),

      // ── Drafts ──
      setDrafts: (drafts) => {
        const byId: Record<string, OutreachDraft> = {};
        drafts.forEach((d) => { byId[d.id] = d; });
        set({ draftsById: byId });
      },
      getDraftsForJob: (_jobId, _plan) => {
        // Return all drafts — in a real app we'd filter by job/plan step IDs
        return Object.values(get().draftsById);
      },
      updateDraftStatus: (draftId, status) =>
        set((s) => {
          const draft = s.draftsById[draftId];
          if (!draft) return s;
          return {
            draftsById: {
              ...s.draftsById,
              [draftId]: { ...draft, status, lastEditedAt: new Date().toISOString() },
            },
          };
        }),
      updateDraftBody: (draftId, body) =>
        set((s) => {
          const draft = s.draftsById[draftId];
          if (!draft) return s;
          return {
            draftsById: {
              ...s.draftsById,
              [draftId]: { ...draft, body, status: 'EDITED' as const, lastEditedAt: new Date().toISOString() },
            },
          };
        }),
      updateDraftSubject: (draftId, subject) =>
        set((s) => {
          const draft = s.draftsById[draftId];
          if (!draft) return s;
          return {
            draftsById: {
              ...s.draftsById,
              [draftId]: { ...draft, subject, lastEditedAt: new Date().toISOString() },
            },
          };
        }),
      approveAllDrafts: () =>
        set((s) => {
          const updated: Record<string, OutreachDraft> = {};
          for (const [id, d] of Object.entries(s.draftsById)) {
            updated[id] = { ...d, status: 'APPROVED', lastEditedAt: new Date().toISOString() };
          }
          return { draftsById: updated };
        }),

      // ── Execution ──
      setExecution: (jobId, data) =>
        set((s) => ({
          executionByJobId: { ...s.executionByJobId, [jobId]: data },
        })),
      addEvent: (jobId, event) =>
        set((s) => {
          const existing = s.executionByJobId[jobId] || { byLead: [], events: [] };
          return {
            executionByJobId: {
              ...s.executionByJobId,
              [jobId]: { ...existing, events: [...existing.events, event] },
            },
          };
        }),
      updateLeadExecStatus: (jobId, leadId, status, nextActionAt) =>
        set((s) => {
          const existing = s.executionByJobId[jobId];
          if (!existing) return s;
          return {
            executionByJobId: {
              ...s.executionByJobId,
              [jobId]: {
                ...existing,
                byLead: existing.byLead.map((l) =>
                  l.leadId === leadId
                    ? { ...l, status, nextActionAt: nextActionAt ?? l.nextActionAt }
                    : l
                ),
              },
            },
          };
        }),
      advanceLeadStep: (jobId, leadId, newStepId) =>
        set((s) => {
          const existing = s.executionByJobId[jobId];
          if (!existing) return s;
          return {
            executionByJobId: {
              ...s.executionByJobId,
              [jobId]: {
                ...existing,
                byLead: existing.byLead.map((l) =>
                  l.leadId === leadId
                    ? { ...l, currentStepId: newStepId, status: 'QUEUED' as const }
                    : l
                ),
              },
            },
          };
        }),
    }),
    { name: 'sa-agent-outreach' }
  )
);
