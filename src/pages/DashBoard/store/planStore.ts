import { create } from "zustand"
import type { PlanItem } from "@/pages/DashBoard/api/loadPlanItem"
import type { TripDay } from "../utils/generateTripDays"
import { dragUpdate, type DraggedPlanItem } from "../api/dragUpdate" 
import { deletePlanItem } from "../api/deletePlanItem"
import { editUpdate } from "../api/editUpdate"

type PlanStore = {
  tripDays: TripDay[]
  selectedDay: string
  allPlanItems: PlanItem[]
  editingItemIds: string[] 

  setTripDays: (days: TripDay[]) => void
  setSelectedDay: (day: string) => void
  setAllPlanItems: (items: PlanItem[]) => void
  addPlanItem: (item: PlanItem) => void
  updatePlanItem: (itemId: string, updates: Partial<PlanItem>) => void
  deletePlanItem: (itemId: string) => Promise<void>

  addEditingItem: (itemId: string) => void
  removeEditingItem: (itemId: string) => void
  clearEditingItems: () => void
  confirmEditItem: (itemId: string, updates: { title: string; duration: number }) => Promise<void>

  reorderPlanItems: (
    itemId: string,
    groupId: string,
    day: string,
    currentItems: PlanItem[]
  ) => Promise<void>

  getSelectedDayItems: () => PlanItem[]
}

export const usePlanStore = create<PlanStore>((set, get) => ({
  tripDays: [],
  selectedDay: "",
  allPlanItems: [],
  editingItemIds: [],

  setTripDays: (days) => set({ tripDays: days }),
  setSelectedDay: (day) => set({ selectedDay: day }),
  setAllPlanItems: (items) => set({ allPlanItems: items }),

  addPlanItem: (item) => {
    const { allPlanItems } = get()
    set({ allPlanItems: [...allPlanItems, item] })
  },

  updatePlanItem: (itemId, updates) => {
    const { allPlanItems } = get()
    set({
      allPlanItems: allPlanItems.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    })
  },

  deletePlanItem: async (itemId) => {
    try {
      await deletePlanItem(itemId)
      const { allPlanItems } = get()
      set({
        allPlanItems: allPlanItems.filter((item) => item.id !== itemId),
      })
      console.log("✅ 일정 삭제 성공:", itemId)
    } catch (err) {
      console.error("❌ 일정 삭제 실패:", err)
    }
  },

  addEditingItem: (itemId) =>
    set((state) => ({
      editingItemIds: [...state.editingItemIds, itemId],
    })),
  removeEditingItem: (itemId) =>
    set((state) => ({
      editingItemIds: state.editingItemIds.filter((id) => id !== itemId),
    })),
  clearEditingItems: () => set({ editingItemIds: [] }),

  confirmEditItem: async (itemId, updates) => {
    const { selectedDay, allPlanItems } = get()
    const item = allPlanItems.find((i) => i.id === itemId)
    if (!item) return

    try {
      const updated = await editUpdate({
        itemId,
        groupId: item.group_id,
        day: selectedDay,
        title: updates.title,
        duration: updates.duration,
      })

      set({
        allPlanItems: allPlanItems.map((i) =>
          i.id === updated.id ? updated : i
        ),
        editingItemIds: get().editingItemIds.filter((id) => id !== itemId),
      })
    } catch (err) {
      console.error("❌ 수정 실패:", err)
    }
  },

  reorderPlanItems: async (itemId, groupId, day, currentItems) => {
    try {
      const withDraggedFlag: DraggedPlanItem[] = currentItems.map((item) => ({
        ...item,
        dragged: item.id === itemId,
      }))

      const updated = await dragUpdate({
        itemId,
        groupId,
        day,
        currentItems: withDraggedFlag,
      })

      const { allPlanItems } = get()
      set({
        allPlanItems: allPlanItems.map((i) =>
          i.id === updated.id ? updated : i
        ),
      })
    } catch (err) {
      console.error("reorderPlanItems 실패:", err)
    }
  },

  getSelectedDayItems: () => {
    const { allPlanItems, selectedDay } = get()
    return allPlanItems
      .filter((item) => item.day === selectedDay)
      .sort((a, b) => a.sort_order.localeCompare(b.sort_order))
  },
}))
