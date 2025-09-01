import { supabase } from "@/lib/supabaseClient";

/**
 * Supabase Storage 파일 삭제 함수
 * @param bucket 삭제할 버킷
 * @param fileName 삭제할 파일 이름
 */
export async function deleteFileFromStorage(
  bucket: string,
  fileName: string,
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([fileName]);

  if (error) throw error;
}
