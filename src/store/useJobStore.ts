import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Job } from '../types/job';
import type { JobStatus } from '../types/common';

interface JobState {
  jobsById: Record<string, Job>;

  setJobs: (jobs: Job[]) => void;
  createJob: (job: Job) => void;
  advanceJobStatus: (jobId: string) => void;
  setJobStatus: (jobId: string, status: JobStatus) => void;
  cancelJob: (jobId: string) => void;
  updateJobProgress: (jobId: string, stage: number) => void;
  setJobEvidence: (jobId: string, evidenceId: string) => void;
  setJobOutputs: (jobId: string, outputs: Job['outputs']) => void;
  markViewed: (jobId: string) => void;
  archiveJob: (jobId: string) => void;
  unarchiveJob: (jobId: string) => void;
  renameJob: (jobId: string, title: string) => void;
  deleteJob: (jobId: string) => void;
}

const STATUS_ORDER: JobStatus[] = [
  'QUEUED',
  'RUNNING',
  'NEEDS_APPROVAL',
  'COMPLETED',
];

export const useJobStore = create<JobState>()(
  persist(
    (set) => ({
      jobsById: {},

      setJobs: (jobs) => {
        const byId: Record<string, Job> = {};
        jobs.forEach((j) => { byId[j.id] = j; });
        set({ jobsById: byId });
      },

      createJob: (job) =>
        set((state) => ({
          jobsById: { ...state.jobsById, [job.id]: job },
        })),

      advanceJobStatus: (jobId) =>
        set((state) => {
          const job = state.jobsById[jobId];
          if (!job) return state;
          const currentIdx = STATUS_ORDER.indexOf(job.status);
          if (currentIdx === -1 || currentIdx >= STATUS_ORDER.length - 1) return state;
          const nextStatus = STATUS_ORDER[currentIdx + 1];
          return {
            jobsById: {
              ...state.jobsById,
              [jobId]: { ...job, status: nextStatus, updatedAt: new Date().toISOString() },
            },
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

      cancelJob: (jobId) =>
        set((state) => {
          const job = state.jobsById[jobId];
          if (!job) return state;
          return {
            jobsById: {
              ...state.jobsById,
              [jobId]: { ...job, status: 'CANCELLED', updatedAt: new Date().toISOString() },
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
              [jobId]: { ...job, viewedAt: new Date().toISOString() },
            },
          };
        }),

      archiveJob: (jobId) =>
        set((state) => {
          const job = state.jobsById[jobId];
          if (!job) return state;
          return {
            jobsById: { ...state.jobsById, [jobId]: { ...job, archived: true } },
          };
        }),

      unarchiveJob: (jobId) =>
        set((state) => {
          const job = state.jobsById[jobId];
          if (!job) return state;
          return {
            jobsById: { ...state.jobsById, [jobId]: { ...job, archived: false } },
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
          return { jobsById: rest };
        }),
    }),
    { name: 'sa-agent-jobs' }
  )
);
