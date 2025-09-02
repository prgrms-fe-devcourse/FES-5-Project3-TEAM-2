import { create } from "zustand"

type FocusStore = {
  planItemId : string | null;
  setPlanItemId : (id:string) => void
}

export const useFocusStore = create<FocusStore>((set) => ({
  planItemId: null,

  setPlanItemId: (id) => set({ planItemId: id }),

  clearPlanItemId: () => set({ planItemId: null }),
}))