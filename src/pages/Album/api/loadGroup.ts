import { supabase } from "@/lib/supabaseClient";

export const loadGroup = async (
  groupId?: string,
): Promise<{ start_day: string; end_day: string } | null> => {
  if (!groupId) return null;

  const { data, error } = await supabase
    .from("groups")
    .select("start_day, end_day")
    .eq("id", groupId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
