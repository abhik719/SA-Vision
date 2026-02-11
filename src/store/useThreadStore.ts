import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Thread, Message } from '../types/thread';
import type { ThreadType } from '../types/common';

interface ThreadState {
  threadsById: Record<string, Thread>;
  threadOrder: string[];

  setThreads: (threads: Thread[]) => void;
  addMessage: (threadId: string, message: Message) => void;
  createThread: (params: {
    title: string;
    type: ThreadType;
    seedMessage?: string;
    scope?: Thread['scope'];
  }) => string;
  updateThread: (threadId: string, updates: Partial<Thread>) => void;
  pinThread: (threadId: string) => void;
  unpinThread: (threadId: string) => void;
  updateDecisionChips: (threadId: string, chips: string[]) => void;
  addSpawnedJob: (threadId: string, jobId: string) => void;
  updateMiniOutcome: (threadId: string, outcome: string) => void;
  deleteThread: (threadId: string) => void;
  renameThread: (threadId: string, title: string) => void;
  setThreadSection: (threadId: string, section: string | undefined) => void;
  archiveThread: (threadId: string) => void;
  unarchiveThread: (threadId: string) => void;
}

let threadCounter = 100;

export const useThreadStore = create<ThreadState>()(
  persist(
    (set, _get) => ({
      threadsById: {},
      threadOrder: [],

      setThreads: (threads) => {
        const byId: Record<string, Thread> = {};
        const order: string[] = [];
        threads.forEach((t) => {
          byId[t.id] = t;
          order.push(t.id);
        });
        set({ threadsById: byId, threadOrder: order });
      },

      addMessage: (threadId, message) =>
        set((state) => {
          const thread = state.threadsById[threadId];
          if (!thread) return state;
          return {
            threadsById: {
              ...state.threadsById,
              [threadId]: {
                ...thread,
                messages: [...thread.messages, message],
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),

      createThread: ({ title, type, seedMessage, scope }) => {
        const id = `thr_${++threadCounter}`;
        const now = new Date().toISOString();
        const messages: Message[] = [];
        if (seedMessage) {
          messages.push({
            id: `msg_${Date.now()}`,
            role: 'seller',
            timestamp: now,
            content: seedMessage,
          });
        }
        const thread: Thread = {
          id,
          title,
          type,
          pinned: false,
          scope: scope || {},
          createdAt: now,
          updatedAt: now,
          decisionChips: [],
          spawnedJobIds: [],
          messages,
        };
        set((state) => ({
          threadsById: { ...state.threadsById, [id]: thread },
          threadOrder: [id, ...state.threadOrder],
        }));
        return id;
      },

      updateThread: (threadId, updates) =>
        set((state) => {
          const thread = state.threadsById[threadId];
          if (!thread) return state;
          return {
            threadsById: {
              ...state.threadsById,
              [threadId]: { ...thread, ...updates },
            },
          };
        }),

      pinThread: (threadId) =>
        set((state) => {
          const thread = state.threadsById[threadId];
          if (!thread) return state;
          return {
            threadsById: {
              ...state.threadsById,
              [threadId]: { ...thread, pinned: true },
            },
          };
        }),

      unpinThread: (threadId) =>
        set((state) => {
          const thread = state.threadsById[threadId];
          if (!thread) return state;
          return {
            threadsById: {
              ...state.threadsById,
              [threadId]: { ...thread, pinned: false },
            },
          };
        }),

      updateDecisionChips: (threadId, chips) =>
        set((state) => {
          const thread = state.threadsById[threadId];
          if (!thread) return state;
          return {
            threadsById: {
              ...state.threadsById,
              [threadId]: { ...thread, decisionChips: chips },
            },
          };
        }),

      addSpawnedJob: (threadId, jobId) =>
        set((state) => {
          const thread = state.threadsById[threadId];
          if (!thread) return state;
          return {
            threadsById: {
              ...state.threadsById,
              [threadId]: {
                ...thread,
                spawnedJobIds: [...thread.spawnedJobIds, jobId],
              },
            },
          };
        }),

      updateMiniOutcome: (threadId, outcome) =>
        set((state) => {
          const thread = state.threadsById[threadId];
          if (!thread) return state;
          return {
            threadsById: {
              ...state.threadsById,
              [threadId]: { ...thread, miniOutcome: outcome },
            },
          };
        }),

      deleteThread: (threadId) =>
        set((state) => {
          const { [threadId]: _, ...rest } = state.threadsById;
          return {
            threadsById: rest,
            threadOrder: state.threadOrder.filter((id) => id !== threadId),
          };
        }),

      renameThread: (threadId, title) =>
        set((state) => {
          const thread = state.threadsById[threadId];
          if (!thread) return state;
          return {
            threadsById: {
              ...state.threadsById,
              [threadId]: { ...thread, title },
            },
          };
        }),

      setThreadSection: (threadId, section) =>
        set((state) => {
          const thread = state.threadsById[threadId];
          if (!thread) return state;
          return {
            threadsById: {
              ...state.threadsById,
              [threadId]: { ...thread, section, archived: false },
            },
          };
        }),

      archiveThread: (threadId) =>
        set((state) => {
          const thread = state.threadsById[threadId];
          if (!thread) return state;
          return {
            threadsById: {
              ...state.threadsById,
              [threadId]: { ...thread, archived: true, section: undefined },
            },
          };
        }),

      unarchiveThread: (threadId) =>
        set((state) => {
          const thread = state.threadsById[threadId];
          if (!thread) return state;
          return {
            threadsById: {
              ...state.threadsById,
              [threadId]: { ...thread, archived: false },
            },
          };
        }),
    }),
    { name: 'sa-agent-threads' }
  )
);
