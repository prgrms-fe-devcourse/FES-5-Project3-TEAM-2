import { supabase } from "@/lib/supabaseClient";

export async function getMyUserId(): Promise<string | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("❌ 유저 ID 가져오기 실패:", error.message);
    return null;
  }

  return user?.id ?? null;
}