
import { toast } from "@/components/Sweetalert";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // 세션 가져오기
        let { data: { session } } = await supabase.auth.getSession();

        // 세션이 없으면 이벤트 한 번 대기
        if (!session) {
          session = await new Promise((resolve) => {
            const { data: {subscription} } = supabase.auth.onAuthStateChange(
              (event, s) => {
                if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
                  subscription.unsubscribe();
                  resolve(s ?? null);
                }
              }
            );
          });
        }

        // 3) 세션이 있으면 프로필 업데이트 후 그룹 페이지 이동
        if (session) {
          const { user } = session;

          // 프로필 upsert: 타입 정확히 맞추기 (email은 string 필요)
          const profileValues: import("@/types/supabase").TablesInsert<"profile"> = {
            id: user.id,
            email: user.email ?? `${user.id}@local`,
            name:
              (user.user_metadata?.full_name as string | undefined) ??
              (user.email ? user.email.split("@")[0] : "user"),
            avatar_url: (user.user_metadata?.avatar_url as string | null | undefined) ?? null,
          };

          await supabase
            .from("profile")
            .upsert(profileValues, { onConflict: "id" });

          toast({
            title: "로그인 성공! 환영합니다🎉",
            icon: "success",
            position: "top-end",
          });

          navigate(`/groups/${user.id}`, { replace: true });
        } else {
          toast({
            title: "로그인에 실패했습니다. 다시 시도해주세요.",
            icon: "error",
            position: "top-end",
          });

          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("AuthCallback error:", error);
        toast({
          title: "로그인 처리 중 오류가 발생했습니다.",
          icon: "error",
          position: "top-end",
        });

        navigate("/", { replace: true });
      }
    };

    handleAuth();
  }, [navigate]);

  return null;
}
