import { create } from "zustand";

type Group = { id: string; name: string } | null;

type GroupState = {
  currentGroup: Group;
  setCurrentGroup: (g: Group) => void;
  clearGroup: () => void;
};

export const useGroupStore = create<GroupState>((set) => ({
  currentGroup: null,
  setCurrentGroup: (g) => set({ currentGroup: g }),
  clearGroup: () => set({ currentGroup: null }),
}));
