// stores/planStore.ts
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
  // ─────────────────────────────
  // 상태
  tripDays: TripDay[];
  selectedDay: string;
  allPlanItems: PlanItem[];
  editingItemIds: EditingUser[];

  // ─────────────────────────────
  // Setter
  setTripDays: (days: TripDay[]) => void;
  setSelectedDay: (day: string) => void;
  setAllPlanItems: (items: PlanItem[]) => void;
  setEditingItems: (items: EditingUser[]) => void;

  // ─────────────────────────────
  // CRUD 액션
  addPlanItem: (item: PlanItem) => void;
  updatePlanItem: (itemId: string, updates: Partial<PlanItem>) => void;
  removePlanItem: (itemId: string) => void;
  deletePlanItem: (itemId: string) => Promise<void>;

  // ─────────────────────────────
  // 편집 액션 (로컬/DB/브로드캐스트)
  addEditingItem: (itemId: string) => void;
  removeEditingItem: (itemId: string) => void;
  clearEditingItems: () => void;

  addEditingItemRemote: (itemId: string, userId: string, userName: string) => void;
  removeEditingItemRemote: (itemId: string, userId: string) => void;

  confirmEditItem: (
    itemId: string,
    updates: { title: string; duration: number }
  ) => Promise<void>;

  // ─────────────────────────────
  // 기타
  reorderPlanItems: (
    itemId: string,
    groupId: string,
    day: string,
    currentItems: PlanItem[]
  ) => Promise<void>;

  getSelectedDayItems: () => PlanItem[];
};

// ─────────────────────────────
// 메인 Store
export const usePlanStore = create<PlanStore>((set, get) => ({
  // 상태 초기값
  tripDays: [],
  selectedDay: "",
  allPlanItems: [],
  editingItemIds: [],

  // Setter
  setTripDays: (days) => set({ tripDays: days }),
  setSelectedDay: (day) => set({ selectedDay: day }),
  setAllPlanItems: (items) => set({ allPlanItems: items }),
  setEditingItems: (items) => set({ editingItemIds: items }),

  // ─────────────────────────────
  // CRUD 액션
  addPlanItem: (item) =>
    set((state) => ({ allPlanItems: [...state.allPlanItems, item] })),

  updatePlanItem: (itemId, updates) =>
    set((state) => ({
      allPlanItems: state.allPlanItems.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    })),

  removePlanItem: (itemId) =>
    set((state) => ({
      allPlanItems: state.allPlanItems.filter((item) => item.id !== itemId),
    })),

  deletePlanItem: async (itemId) => {
    try {
      await deletePlanItem(itemId);
      set((state) => ({
        allPlanItems: state.allPlanItems.filter((item) => item.id !== itemId),
      }));
    } catch (err) {
      console.error("일정 삭제 실패:", err);
    }
  },

  // ─────────────────────────────
  // 편집 시작
  addEditingItem: (itemId) => {
    const myProfile = usePresenceStore.getState().myProfile;
    const group = useGroupStore.getState().group;
    if (!myProfile || !group) return;

    const { id: userId, name: userName } = myProfile;

    // 이미 내가 편집 중이면 차단
    if (get().editingItemIds.some((e) => e.userId === userId)) {
      console.warn("이미 다른 아이템을 편집 중입니다.");
      return;
    }

    const item = get().allPlanItems.find((i) => i.id === itemId);
    if (!item) return;

    (async () => {
      try {
        const { data, error } = await supabase
          .from("planitems")
          .update({ editing: userId })
          .eq("id", itemId)
          .eq("group_id", item.group_id)
          .eq("day", item.day)
          .is("editing", null)
          .select("id")
          .maybeSingle();

        if (error) {
          console.error("편집 시작 DB 반영 실패:", error);
          return;
        }
        if (!data) {
          console.warn("편집 클레임 실패: 이미 다른 사용자가 편집 중입니다.");
          return;
        }

        // 로컬 반영
        set((state) => ({
          editingItemIds: [...state.editingItemIds, { itemId, userId, userName }],
        }));

        // Broadcast
        supabase.channel(group.id).send({
          type: "broadcast",
          event: "edit-start",
          payload: { itemId, userId, userName },
        });
      } catch (e) {
        console.error("편집 시작 DB 반영 실패:", e);
      }
    })();
  },

  // 편집 종료
  removeEditingItem: (itemId) => {
    const myProfile = usePresenceStore.getState().myProfile;
    const group = useGroupStore.getState().group;
    if (!myProfile || !group) return;

    const { id: userId } = myProfile;
    const item = get().allPlanItems.find((i) => i.id === itemId);
    if (!item) return;

    (async () => {
      try {
        await supabase
          .from("planitems")
          .update({ editing: null })
          .eq("id", itemId)
          .eq("group_id", item.group_id)
          .eq("day", item.day)
          .eq("editing", userId);
      } catch (e) {
        console.error("편집 종료 DB 반영 실패:", e);
      } finally {
        set((state) => ({
          editingItemIds: state.editingItemIds.filter(
            (e) => !(e.itemId === itemId && e.userId === userId)
          ),
        }));

        // Broadcast
        supabase.channel(group.id).send({
          type: "broadcast",
          event: "edit-end",
          payload: { itemId, userId },
        });
      }
    })();
  },

  clearEditingItems: () => set({ editingItemIds: [] }),

  // ─────────────────────────────
  // 원격 Broadcast 수신 처리
  addEditingItemRemote: (itemId, userId, userName) =>
    set((state) => {
      if (state.editingItemIds.some((e) => e.itemId === itemId && e.userId === userId)) {
        return state; // 중복 방지
      }
      return {
        editingItemIds: [...state.editingItemIds, { itemId, userId, userName }],
      };
    }),

  removeEditingItemRemote: (itemId, userId) =>
    set((state) => ({
      editingItemIds: state.editingItemIds.filter(
        (e) => !(e.itemId === itemId && e.userId === userId)
      ),
    })),

  // ─────────────────────────────
  // 편집 저장 확정
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
        editorUserId: userId,
      });

      set({
        allPlanItems: allPlanItems.map((i) => (i.id === updated.id ? updated : i)),
        editingItemIds: get().editingItemIds.filter((e) => e.itemId !== itemId),
      });

      supabase.channel(group.id).send({
        type: "broadcast",
        event: "edit-end",
        payload: { itemId, userId },
      });
    } catch (err) {
      console.error("편집 저장 실패:", err);
    }
  },

  // ─────────────────────────────
  // Drag & Drop 순서 변경
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

      set((state) => ({
        allPlanItems: state.allPlanItems.map((i) =>
          i.id === updated.id ? updated : i
        ),
      }));
    } catch (err) {
      console.error("reorderPlanItems 실패:", err);
    }
  },

  // ─────────────────────────────
  // 선택된 날짜 일정 가져오기
  getSelectedDayItems: () => {
    const { allPlanItems, selectedDay } = get();
    return allPlanItems
      .filter((item) => item.day === selectedDay)
      .sort((a, b) => a.sort_order.localeCompare(b.sort_order));
  },
}));
