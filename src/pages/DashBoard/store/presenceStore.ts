
import { create } from "zustand";
import type { MyProfile } from "../api/getMyProfile";


type PresenceState = {
  myProfile: MyProfile | null;  
  onlineUserIds: string[];
  setMyProfile: (p: MyProfile | null) => void;
  setOnlineUserIds: (ids: string[]) => void;
};

export const usePresenceStore = create<PresenceState>((set) => ({
  myProfile: null,
  onlineUserIds: [],
  setMyProfile: (p) => set({ myProfile: p }),
  setOnlineUserIds: (ids) => set({ onlineUserIds: ids }),
}));
