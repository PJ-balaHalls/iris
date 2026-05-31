import { create } from "zustand";

import type { PrivateAccessSession } from "@/types/private-login.types";

type PrivateAccessStore = {
  activeAccess: PrivateAccessSession | null;
  keepConnected: boolean;
  setActiveAccess: (session: PrivateAccessSession | null) => void;
  setKeepConnected: (enabled: boolean) => void;
  clearActiveAccess: () => void;
};

export const usePrivateAccessStore = create<PrivateAccessStore>((set) => ({
  activeAccess: null,
  keepConnected: false,
  setActiveAccess: (session) => set({ activeAccess: session }),
  setKeepConnected: (enabled) => set({ keepConnected: enabled }),
  clearActiveAccess: () => set({ activeAccess: null })
}));
