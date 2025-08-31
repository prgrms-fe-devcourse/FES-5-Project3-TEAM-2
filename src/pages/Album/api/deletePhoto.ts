import { supabase } from "@/lib/supabaseClient";

// DB에서 사진 삭제
export async function deletePhotoFromDatabase(photoId: string): Promise<void> {
  const { error } = await supabase.from("photos").delete().eq("id", photoId);

  if (error) throw error;
}

// Storage에서 파일 삭제
export async function deleteFileFromStorage(fileName: string): Promise<void> {
  const { error } = await supabase.storage
    .from("album-photos")
    .remove([fileName]);

  if (error) throw error;
}
