import { supabase } from "@/lib/supabaseClient";

// DB에서 사진 삭제
export async function deletePhotoFromDatabase(photoId: string): Promise<void> {
  const { error } = await supabase.from("photos").delete().eq("id", photoId);

  if (error) throw error;
}
