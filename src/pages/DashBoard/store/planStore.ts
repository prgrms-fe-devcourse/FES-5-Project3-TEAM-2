import { create } from "zustand";
import type { PlanItem } from "@/pages/DashBoard/api/loadPlanItem";
import type { TripDay } from "../utils/generateTripDays";
import { dragUpdate, type DraggedPlanItem } from "../api/dragUpdate";
import { deletePlanItem } from "../api/deletePlanItem";
import { editUpdate } from "../api/editUpdate";
import { supabase } from "@/lib/supabaseClient";
import { useGroupStore } from "./groupStore";
import { usePresenceStore } from "./presenceStore";

type EditingUser = {
  itemId: string;
  userId: string;
  userName: string;
};

type PlanStore = {
  tripDays: TripDay[];
  selectedDay: string;
  allPlanItems: PlanItem[];
  editingItemIds: EditingUser[];


  setTripDays: (days: TripDay[]) => void;
  setSelectedDay: (day: string) => void;
  setAllPlanItems: (items: PlanItem[]) => void;
  addPlanItem: (item: PlanItem) => void;
  updatePlanItem: (itemId: string, updates: Partial<PlanItem>) => void;
  removePlanItem: (itemId: string) => void;
  deletePlanItem: (itemId: string) => Promise<void>;

  addEditingItem: (itemId: string) => void;
  removeEditingItem: (itemId: string) => void;
  clearEditingItems: () => void;

  // 원격 Broadcast 수신 처리
  addEditingItemRemote: (
    itemId: string,
    userId: string,
    userName: string,
  ) => void;
  removeEditingItemRemote: (itemId: string, userId: string) => void;


  confirmEditItem: (
    itemId: string,
    updates: { title: string; duration: number },
  ) => Promise<void>;

  reorderPlanItems: (
    itemId: string,
    groupId: string,
    day: string,
    currentItems: PlanItem[],
  ) => Promise<void>;

  getSelectedDayItems: () => PlanItem[];
};

export const usePlanStore = create<PlanStore>((set, get) => ({
  tripDays: [],
  selectedDay: "",
  allPlanItems: [],
  editingItemIds: [],

  setTripDays: (days) => set({ tripDays: days }),
  setSelectedDay: (day) => set({ selectedDay: day }),
  setAllPlanItems: (items) => set({ allPlanItems: items }),

  addPlanItem: (item) => {
    const { allPlanItems } = get();
    set({ allPlanItems: [...allPlanItems, item] });
  },

  updatePlanItem: (itemId, updates) => {
    const { allPlanItems } = get();
    set({
      allPlanItems: allPlanItems.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item,
      ),
    });
  },


  removePlanItem: (itemId: string) => {
    const { allPlanItems } = get();
    set({
      allPlanItems: allPlanItems.filter((item) => item.id !== itemId),
    });
  },

  deletePlanItem: async (itemId) => { // 내 UI 위한 목적.
    try {
      await deletePlanItem(itemId);
      const { allPlanItems } = get();
      set({
        allPlanItems: allPlanItems.filter((item) => item.id !== itemId),
      });
    } catch (err) {
      console.error("❌ 일정 삭제 실패:", err);
    }
  },

  // ✅ 편집 시작
  addEditingItem: (itemId) => {
    const myProfile = usePresenceStore.getState().myProfile;
    const group = useGroupStore.getState().group;
    if (!myProfile || !group) return;

    const { id: userId, name: userName } = myProfile;

    set((state) => {
      // 이미 내가 수정 중인 아이템이 있다면 추가 금지
      const alreadyEditing = state.editingItemIds.some(
        (e) => e.userId === userId,
      );
      if (alreadyEditing) {
        console.warn("⚠️ 이미 다른 아이템을 수정 중입니다.");
        return state;
      }

      return {
        editingItemIds: [...state.editingItemIds, { itemId, userId, userName }],
      };
    });

    // Broadcast 전송
    supabase.channel(group.id).send({
      type: "broadcast",
      event: "edit-start",
      payload: { itemId, userId, userName },
    });
  },

  // ✅ 편집 종료
  removeEditingItem: (itemId) => {
    const myProfile = usePresenceStore.getState().myProfile;
    const group = useGroupStore.getState().group;
    if (!myProfile || !group) return;

    const { id: userId } = myProfile;

    set((state) => ({
      editingItemIds: state.editingItemIds.filter(
        (e) => !(e.itemId === itemId && e.userId === userId),
      ),
    }));

    // Broadcast 전송
    supabase.channel(group.id).send({
      type: "broadcast",
      event: "edit-end",
      payload: { itemId, userId },
    });
  },

  clearEditingItems: () => set({ editingItemIds: [] }),

  // ✅ 다른 팀원 Broadcast 수신
  addEditingItemRemote: (itemId, userId, userName) =>
    set((state) => {
      if (
        state.editingItemIds.some(
          (e) => e.itemId === itemId && e.userId === userId,
        )
      ) {
        return state; // 이미 있음 → 중복 방지
      }
      return {
        editingItemIds: [...state.editingItemIds, { itemId, userId, userName }],
      };
    }),

  removeEditingItemRemote: (itemId, userId) =>
    set((state) => ({
      editingItemIds: state.editingItemIds.filter(
        (e) => !(e.itemId === itemId && e.userId === userId),
      ),
    })),

  confirmEditItem: async (itemId, updates) => {
    const { selectedDay, allPlanItems } = get();
    const item = allPlanItems.find((i) => i.id === itemId);
    if (!item) return;

    const myProfile = usePresenceStore.getState().myProfile;
    const group = useGroupStore.getState().group;
    if (!myProfile || !group) return;

    const { id: userId } = myProfile;


    try {
      const updated = await editUpdate({
        itemId,
        groupId: item.group_id,
        day: selectedDay,
        title: updates.title,
        duration: updates.duration,
      });

      set({
        allPlanItems: allPlanItems.map((i) =>
          i.id === updated.id ? updated : i,
        ),
        editingItemIds: get().editingItemIds.filter((e) => e.itemId !== itemId),
      });

      // ✅ 수정 완료 브로드캐스트 전송
      supabase.channel(group.id).send({
        type: "broadcast",
        event: "edit-end",
        payload: { itemId, userId },

      });
    } catch (err) {
      console.error("❌ 수정 실패:", err);
    }
  },

  reorderPlanItems: async (itemId, groupId, day, currentItems) => {
    try {
      const withDraggedFlag: DraggedPlanItem[] = currentItems.map((item) => ({
        ...item,
        dragged: item.id === itemId,
      }));

      const updated = await dragUpdate({
        itemId,
        groupId,
        day,
        currentItems: withDraggedFlag,
      });

      const { allPlanItems } = get();
      set({
        allPlanItems: allPlanItems.map((i) =>
          i.id === updated.id ? updated : i,
        ),
      });
    } catch (err) {
      console.error("reorderPlanItems 실패:", err);
    }
  },

  getSelectedDayItems: () => {
    const { allPlanItems, selectedDay } = get();
    return allPlanItems
      .filter((item) => item.day === selectedDay)
      .sort((a, b) => a.sort_order.localeCompare(b.sort_order));
  },
}));