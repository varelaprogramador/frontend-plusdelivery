import { create } from "zustand";

export type SyncTask = {
  id: string;
  label: string;
};

type SyncQueueState = {
  queue: SyncTask[];
  isSyncing: boolean;
  currentSync: SyncTask | null;
  startSync: (task: SyncTask) => boolean;
  finishSync: () => void;
};

export const useSyncQueue = create<SyncQueueState>((set, get) => ({
  queue: [],
  isSyncing: false,
  currentSync: null,
  startSync: (task: SyncTask) => {
    if (get().isSyncing) {
      set((state) => ({ queue: [...state.queue, task] }));
      return false;
    }
    set({ isSyncing: true, currentSync: task });
    return true;
  },
  finishSync: () => {
    const { queue } = get();
    if (queue.length > 0) {
      const [next, ...rest] = queue;
      set({ currentSync: next, queue: rest });
    } else {
      set({ isSyncing: false, currentSync: null });
    }
  },
}));
