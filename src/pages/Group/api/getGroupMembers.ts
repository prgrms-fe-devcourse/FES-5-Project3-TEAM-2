import { supabase } from "@/lib/supabaseClient";

export async function getGroupMembers(groupId: string) {
  const { data, error } = await supabase
    .from("group_members_with_profile")
    .select("user_id, name, avatar_url, role, created_at")
    .eq("group_id", groupId);

  if (error) {
    console.error("Error fetching group members:", error.message);
    throw error;
  }

  return data;
}