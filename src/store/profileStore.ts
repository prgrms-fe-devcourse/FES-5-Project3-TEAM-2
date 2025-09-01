import { fetchProfileById } from "@/pages/Group/api/profile";
import type { Tables } from "@/types/supabase";
import { create } from "zustand";
import { persist } from "zustand/middleware";


interface ProfileState {
  profile:Tables<"profile"> | null;
  loading: boolean;
  error: string | null;
  setProfile: (p: Tables<"profile"> | null) => void;
  fetchProfile: (userId:string) => Promise<void>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      loading: false,
      error: null,

      setProfile: (p) => set({ profile: p }),

      fetchProfile: async (userId: string) => {
        const current = get().profile;
        if (current?.id === userId) return;

        set({ loading: true, error: null });
        try {
          const data = await fetchProfileById(userId);
          set({ profile: data, loading: false });
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "프로필 로드 실패";
          set({ error: msg, loading: false });
        }
      },


      clearProfile: () => set({ profile: null, loading: false, error: null }),
    }),
    {
      name: "profile-store",                 // localStorage 키
      partialize: (s) => ({ profile: s.profile }), // profile만 저장
    }
  )
);
