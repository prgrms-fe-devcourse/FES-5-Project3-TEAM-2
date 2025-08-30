import { supabase } from "@/lib/supabaseClient";

export type MyProfile = {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
};

export async function getMyProfile(): Promise<MyProfile | null> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("❌ 유저 인증 정보 없음:", authError?.message);
    return null;
  }

  const { data, error } = await supabase
    .from("profile")
    .select("id, email, name, avatar_url")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("❌ 프로필 가져오기 실패:", error.message);
    return null;
  }

  return data;
}
