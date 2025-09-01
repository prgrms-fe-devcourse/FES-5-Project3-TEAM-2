import { supabase } from "@/lib/supabaseClient";
import type { Tables } from "@/types/supabase";
import { create } from "zustand";
import { persist } from "zustand/middleware";


type GroupState = {
  currentGroup: Tables<'groups'> | null;
  loading: boolean;
  error: string | null;
  setCurrentGroup: (g: Tables<'groups'>) => void;
  clearGroup: () => void;
  fetchGroup: (groupId: string) => Promise<void>;
};

export const useGroupStore = create<GroupState>()(
  persist(
    (set, get) => ({
      currentGroup: null,
      loading: false,
      error: null,

      setCurrentGroup: (g) => set({ currentGroup: g }),
      clearGroup: () => set({ currentGroup: null, loading: false, error: null }),

      fetchGroup: async (groupId: string) => {
        // 같은 id면 재요청 불필요
        if (get().currentGroup?.id === groupId) return;

        set({ loading: true, error: null });
        const { data, error } = await supabase
          .from("groups")
          .select("id, name")
          .eq("id", groupId)
          .single();

        if (error) {
          set({ error: error.message, loading: false, currentGroup: null });
        } else {
          set({ currentGroup: data as Tables<'groups'>, loading: false });
        }
      },
    }),
    {
      name: "group-store",
      // currentGroup만 저장
      partialize: (s) => ({ currentGroup: s.currentGroup }),
    }
  )
);
