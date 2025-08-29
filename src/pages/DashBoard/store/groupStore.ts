import { create } from "zustand"
import type { Group } from "@/pages/DashBoard/api/loadGroupData"

type GroupStore = {
  group: Group | null
  setGroup: (g: Group) => void
  clearGroup: () => void
}

export const useGroupStore = create<GroupStore>((set) => ({
  group: null,

  setGroup: (g) => set({ group: g }),

  clearGroup: () => set({ group: null }),
}))