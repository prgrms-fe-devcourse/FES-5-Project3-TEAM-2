import { useEffect, useState } from "react";
import { getGroupMembers } from "@/pages/Group/api/getGroupMembers";

type GroupMember = {
  user_id: string;
  name: string;
  avatar_url: string | null;
  role: "admin" | "member";
  created_at: string;
};

export function useGroupMembers(groupId: string | undefined) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!groupId) return;
    setLoading(true);

    getGroupMembers(groupId)
      .then((data) => {
        if (data) setMembers(data as GroupMember[]); 
      })
      .finally(() => setLoading(false));
  }, [groupId]);

  // TODO: Presence 구독 추가 예정
  // 예: supabase.channel(`group:${groupId}`).on("presence", ...)
  // 여기서 setOnlineUserIds([...]) 업데이트

  return { members, onlineUserIds, loading };
}