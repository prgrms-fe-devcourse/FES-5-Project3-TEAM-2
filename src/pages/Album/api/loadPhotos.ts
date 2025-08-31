import { supabase } from "@/lib/supabaseClient";
import type { Photo } from "../types/photo";

export const loadPhotos = async (groupId?: string): Promise<Photo[]> => {
  if (!groupId) {
    return [];
  }

  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};
