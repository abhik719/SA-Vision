import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Job } from '../types/job';
import type { Message } from '../types/thread';
import type { JobStatus, JobType, JobKind } from '../types/common';

interface JobState {
  jobsById: Record<string, Job>;
  jobOrder: string[];

  setJobs: (jobs: Job[]) => void;
  createJob: (params: {
    title: string;
    type: JobType;
    kind: JobKind;
    seedMessage?: string;
    scope?: Job['scope'];
    evidenceId?: string;
    status?: JobStatus;
    expires_at?: string | null;
    schedule?: Job['schedule'];
    scopeOutput?: string;
    inputs?: Job['inputs'];
    outputs?: Job['outputs'];
    has_unread_results?: boolean;
    linked_context?: Job['linked_context'];
    progressStages?: string[];
    currentStage?: number;
  }) => string;
  /** Create a job directly from a full Job object (for engine use) */
  createJobDirect: (job: Job) => void;
  addMessage: (jobId: string, message: Message) => void;
  updateJob: (jobId: string, updates: Partial<Job>) => void;
  setJobStatus: (jobId: string, status: JobStatus) => void;
  updateJobProgress: (jobId: string, stage: number) => void;
  setJobEvidence: (jobId: string, evidenceId: string) => void;
  setJobOutputs: (jobId: string, outputs: Job['outputs']) => void;
  markViewed: (jobId: string) => void;
  archiveJob: (jobId: string) => void;
  unarchiveJob: (jobId: string) => void;
  renameJob: (jobId: string, title: string) => void;
  deleteJob: (jobId: string) => void;
  addSpawnedJob: (parentJobId: string, childJobId: string) => void;
  updateDecisionChips: (jobId: string, chips: string[]) => void;
}

let jobCounter = 200;

export const useJobStore = create<JobState>()(
  persist(
    (set) => ({
      jobsById: {},
      jobOrder: [],

      setJobs: (jobs) => {
        const byId: Record<string, Job> = {};
        const order: string[] = [];
        jobs.forEach((j) => {
          byId[j.id] = j;
          order.push(j.id);
        });
        set({ jobsById: byId, jobOrder: order });
      },

      createJob: (params) => {
        const id = `job_${++jobCounter}_${Date.now()}`;
        const now = new Date().toISOString();
        const messages: Message[] = [];
        if (params.seedMessage) {
          messages.push({
            id: `msg_${Date.now()}`,
            role: 'seller',
            timestamp: now,
            content: params.seedMessage,
          });
        }
        const job: Job = {
          id,
          kind: params.kind,
          type: params.type,
          title: params.title,
          status: params.status || 'COMPLETED',
          has_unread_results: params.has_unread_results ?? false,
          createdAt: now,
          updatedAt: now,
          last_viewed_at: null,
          expires_at: params.expires_at ?? null,
          archived_at: null,
          schedule: params.schedule ?? null,
          linked_context: params.linked_context ?? null,
          evidenceId: params.evidenceId,
          scopeOutput: params.scopeOutput,
          messages,
          scope: params.scope,
          inputs: params.inputs,
          outputs: params.outputs,
          progressStages: params.progressStages,
          currentStage: params.currentStage,
          spawnedJobIds: [],
        };
        set((state) => ({
          jobsById: { ...state.jobsById, [id]: job },
          jobOrder: [id, ...state.jobOrder],
        }));
        return id;
      },

      createJobDirect: (job) =>
        set((state) => ({
          jobsById: { ...state.jobsById, [job.id]: job },
          jobOrder: state.jobOrder.includes(job.id) ? state.jobOrder : [job.id, ...state.jobOrder],
        })),

      addMessage: (jobId, message) =>
        set((state) => {
          const job = state.jobsById[jobId];
          if (!job) return state;
          return {
            jobsById: {
              ...state.jobsById,
              [jobId]: {
                ...job,
                messages: [...job.messages, message],
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),

      updateJob: (jobId, updates) =>
        set((state) => {
          const job = state.jobsById[jobId];
          if (!job) return state;
          return {
            jobsById: { ...state.jobsById, [jobId]: { ...job, ...updates } },
          };
        }),

      setJobStatus: (jobId, status) =>
        set((state) => {
          const job = state.jobsById[jobId];
          if (!job) return state;
          return {
            jobsById: {
              ...state.jobsById,
              [jobId]: { ...job, status, updatedAt: new Date().toISOString() },
            },
          };
        }),

      updateJobProgress: (jobId, stage) =>
        set((state) => {
          const job = state.jobsById[jobId];
          if (!job) return state;
          return {
            jobsById: { ...state.jobsById, [jobId]: { ...job, currentStage: stage } },
          };
        }),

      setJobEvidence: (jobId, evidenceId) =>
        set((state) => {
          const job = state.jobsById[jobId];
          if (!job) return state;
          return {
            jobsById: { ...state.jobsById, [jobId]: { ...job, evidenceId } },
          };
        }),

      setJobOutputs: (jobId, outputs) =>
        set((state) => {
          const job = state.jobsById[jobId];
          if (!job) return state;
          return {
            jobsById: { ...state.jobsById, [jobId]: { ...job, outputs } },
          };
        }),

      markViewed: (jobId) =>
        set((state) => {
          const job = state.jobsById[jobId];
          if (!job) return state;
          return {
            jobsById: {
              ...state.jobsById,
              [jobId]: {
                ...job,
                has_unread_results: false,
                last_viewed_at: new Date().toISOString(),
              },
            },
          };
        }),

      archiveJob: (jobId) =>
        set((state) => {
          const job = state.jobsById[jobId];
          if (!job) return state;
          return {
            jobsById: {
              ...state.jobsById,
              [jobId]: { ...job, archived_at: new Date().toISOString() },
            },
          };
        }),

      unarchiveJob: (jobId) =>
        set((state) => {
          const job = state.jobsById[jobId];
          if (!job) return state;
          return {
            jobsById: { ...state.jobsById, [jobId]: { ...job, archived_at: null } },
          };
        }),

      renameJob: (jobId, title) =>
        set((state) => {
          const job = state.jobsById[jobId];
          if (!job) return state;
          return {
            jobsById: { ...state.jobsById, [jobId]: { ...job, title } },
          };
        }),

      deleteJob: (jobId) =>
        set((state) => {
          const { [jobId]: _, ...rest } = state.jobsById;
          return {
            jobsById: rest,
            jobOrder: state.jobOrder.filter((id) => id !== jobId),
          };
        }),

      addSpawnedJob: (parentJobId, childJobId) =>
        set((state) => {
          const job = state.jobsById[parentJobId];
          if (!job) return state;
          return {
            jobsById: {
              ...state.jobsById,
              [parentJobId]: {
                ...job,
                spawnedJobIds: [...(job.spawnedJobIds || []), childJobId],
              },
            },
          };
        }),

      updateDecisionChips: (jobId, chips) =>
        set((state) => {
          const job = state.jobsById[jobId];
          if (!job) return state;
          return {
            jobsById: { ...state.jobsById, [jobId]: { ...job, decisionChips: chips } },
          };
        }),
    }),
    { name: 'sa-agent-jobs-v2' }
  )
);
