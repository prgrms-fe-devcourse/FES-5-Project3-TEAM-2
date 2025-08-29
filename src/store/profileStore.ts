import { fetchProfileById } from "@/pages/Group/api/profile";
import type { Profile } from "@/pages/Group/types/profile";
import { create } from "zustand";


interface ProfileState {
  profile:Profile | null;
  loading: boolean;
  error: string | null;
  setProfile: (p: Profile | null) => void;
  fetchProfile: (userId:string) => Promise<void>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false,
  error: null,

  setProfile: (p) => set({ profile: p }),

  fetchProfile: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchProfileById(userId);
      set({ profile: data, loading: false });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "프로필 로드 실패";
      console.error("프로필 로드 실패:", e);
      set({ error: msg, loading: false });
    }
  },

  clearProfile: () => set({ profile: null, loading: false, error: null }),

}),
);
