import { create } from "zustand";


interface Profile {
  name:string;
  avatar_url: string | null;
}

interface ProfileState {
  profile:Profile | null;
  setProfile: (p: Profile | null) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile:null,
  setProfile: (p) => set({profile:p}),
}))
