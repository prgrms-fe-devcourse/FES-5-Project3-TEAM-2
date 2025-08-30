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

  return { members, loading };
}