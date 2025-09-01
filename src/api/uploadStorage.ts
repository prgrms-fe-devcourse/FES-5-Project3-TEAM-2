import { supabase } from "@/lib/supabaseClient";

/**
 * Supabase Storage 파일 업로드 함수
 * @param bucket 업로드할 버킷
 * @param file 업로드할 파일
 * @param fileName 저장할 파일 이름
 * @returns publicUrl (string)
 */
export async function uploadFileToStorage(
  bucket: string,
  file: File,
  fileName: string,
): Promise<string> {
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

  return data.publicUrl;
}
