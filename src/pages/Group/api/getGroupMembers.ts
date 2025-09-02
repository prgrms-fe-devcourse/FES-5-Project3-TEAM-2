import { supabase } from "@/lib/supabaseClient";
import type { Enums } from "@/types/supabase";

export interface GroupMemberWithProfile {
  user_id: string;
  name: string;
  avatar_url: string | null;
  role: Enums<"member_role">;
  created_at: string;
}

export async function getGroupMembers(groupId: string): Promise<GroupMemberWithProfile[]> {
  const { data, error } = await supabase
    .from("group_members_with_profile")
    .select("user_id, name, avatar_url, role, created_at")
    .eq("group_id", groupId);

  if (error) {
    console.error("Error fetching group members:", error.message);
    throw error;
  }

  return (data ?? []) as GroupMemberWithProfile[];
}
