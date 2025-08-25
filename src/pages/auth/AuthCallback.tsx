import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("로그인 처리중...");

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // 세션 가져오기
        let { data: { session } } = await supabase.auth.getSession();

        // 세션이 없으면 이벤트 한 번 대기
        if (!session) {
          session = await new Promise((resolve) => {
            const { data: subscription } = supabase.auth.onAuthStateChange(
              (event, s) => {
                if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
                  subscription.subscription.unsubscribe();
                  resolve(s ?? null);
                }
              }
            );
          });
        }

        // 3) 세션이 있으면 프로필 업데이트 후 그룹 페이지 이동
        if (session) {
          const { user } = session;

          await supabase.from("profile").upsert(
            {
              id: user.id,
              email: user.email,
              name:
                user.user_metadata.full_name ??
                user.email?.split("@")[0] ??
                "user",
              avatar_url: user.user_metadata.avatar_url ?? null,
            },
            { onConflict: "id" }
          );

          setMsg("로그인 성공! 이동중...");
          navigate(`/groups/${user.id}`, { replace: true });
        } else {
          setMsg("로그인에 실패했습니다. 다시 시도해주세요.");
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("AuthCallback error:", error);
        setMsg("로그인 처리 중 오류가 발생했습니다.");
        navigate("/", { replace: true });
      }
    };

    handleAuth();
  }, [navigate]);

  return <p>{msg}</p>;
}
