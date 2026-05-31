import { create } from 'zustand';

interface InviteState {
  attemptsLeft: number;
  inviteId: string | null;
  decrementAttempt: () => void;
  setInvite: (id: string) => void;
  reset: () => void;
}

export const useInviteStore = create<InviteState>((set) => ({
  attemptsLeft: 2,
  inviteId: null,
  decrementAttempt: () => set((state) => ({ attemptsLeft: Math.max(0, state.attemptsLeft - 1) })),
  setInvite: (id) => set({ inviteId: id, attemptsLeft: 2 }),
  reset: () => set({ attemptsLeft: 2, inviteId: null }),
}));