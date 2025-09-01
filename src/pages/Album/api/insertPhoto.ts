import { supabase } from "@/lib/supabaseClient";
import type { Photo } from "../types/photo";

// DB에 사진 insert
export async function insertPhotoToDatabase(
  url: string,
  groupId: string,
): Promise<Photo> {
  const { data: dbData, error: dbError } = await supabase
    .from("photos")
    .insert({
      url,
      group_id: groupId,
    })
    .select()
    .single();

  if (dbError) throw dbError;

  return dbData as Photo;
}
