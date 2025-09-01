import { supabase } from "@/lib/supabaseClient";
import type { Photo } from "../types/photo";

interface LoadPhotosOptions {
  cursor?: string | null;
  limit?: number;
}

export const loadPhotos = async (
  groupId?: string,
  options: LoadPhotosOptions = {},
): Promise<Photo[]> => {
  if (!groupId) {
    return [];
  }

  const { cursor, limit = 30 } = options;

  let query = supabase
    .from("photos")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(limit);

  // cursor 이전의 데이터만 가져오기
  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};
