// src/store/presenceStore.ts
import { create } from "zustand";

type PresenceState = {
  myUserId: string | null;
  onlineUserIds: string[];
  setMyUserId: (id: string | null) => void;
  setOnlineUserIds: (ids: string[]) => void;
};

export const usePresenceStore = create<PresenceState>((set) => ({
  myUserId: null,
  onlineUserIds: [],
  setMyUserId: (id) => set({ myUserId: id }),
  setOnlineUserIds: (ids) => set({ onlineUserIds: ids }),
}));
