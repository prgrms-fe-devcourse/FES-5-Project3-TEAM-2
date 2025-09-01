import { supabase } from "@/lib/supabaseClient";
import type { Photo } from "../types/photo";

// Storage에 파일 업로드
export async function uploadFileToStorage(
  file: File,
  fileName: string,
): Promise<string> {
  const { error: uploadError } = await supabase.storage
    .from("album-photos")
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  // 공개 URL 생성
  const { data } = supabase.storage.from("album-photos").getPublicUrl(fileName);

  return data.publicUrl;
}

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
