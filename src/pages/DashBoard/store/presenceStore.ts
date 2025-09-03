import { create } from "zustand";
import type { MyProfile } from "../api/getMyProfile";


type PresenceState = {
  myProfile: MyProfile | null;  
  onlineUserIds: string[];
  onlineUsersById: Record<string, string>;
  setMyProfile: (p: MyProfile | null) => void;
  setOnlineUserIds: (ids: string[]) => void;
  setOnlineUsersById: (map: Record<string, string>) => void;
};

export const usePresenceStore = create<PresenceState>((set) => ({
  myProfile: null,
  onlineUserIds: [],
  onlineUsersById: {},
  setMyProfile: (p) => set({ myProfile: p }),
  setOnlineUserIds: (ids) => set({ onlineUserIds: ids }),
  setOnlineUsersById: (map) => set({ onlineUsersById: map }),
}));
