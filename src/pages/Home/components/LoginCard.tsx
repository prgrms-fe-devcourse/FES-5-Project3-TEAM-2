import google from "@/assets/icons/google.svg";
import logo from "@/assets/logo.png";
import { useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../../lib/supabaseClient";

export default function LoginCard() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    if (loading) return;

    // 이미 로그인 한 상태라면 바로 그룹 페이지로 이동
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user?.id) {
      navigate(`/groups/${session.user.id}`, { replace: true });
      return;
    }

    setLoading(true);

    const redirectTo = new URL(
      "/auth/callback",
      window.location.origin,
    ).toString();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "openid email profile",
        redirectTo,
      },
    });

    if (error) {
      // console.error("Google login error:", error.message);
      alert("로그인 중 문제가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <div
      className=" w-full max-w-[550px] h-auto
    lg:max-w-[360px] xl:max-w-[480px] 2xl:max-w-[580px]
    mt-20 lg:mt-[120px]
    bg-secondary/10 border-2 border-secondary rounded-[18px]
    shadow-[4px_4px_4px_rgba(0,0,0,0.25)] p-6 sm:p-8
    flex flex-col items-center justify-center"
    >
      <div className="w-full flex flex-col items-center justify-center mb-6">
        <div>
          <img
            src={logo}
            alt="로고 이미지"
            className="block mx-auto w-full max-w-[320px] sm:max-w-[400px] pb-12 sm:pb-[50px]"
          />
        </div>

        <div className="text-center mb-6">
          <h3 className="text-2xl font-sans font-semibold mb-[48px]">Login</h3>
          <p className="text-lg text-neutral-600 mt-1 mb-[48px]">
            로그인하고 Planmingo의 <br /> 다양한 서비스를 이용해 보세요.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-5 py-5
                    bg-white border-2 border-secondary rounded-lg shadow-sm
                    hover:bg-rose-50 transition text-sm text-neutral-700 cursor-pointer
                      disabled:opacity-60 disabled:cursor-default"
        >
          <img src={google} alt="구글 아이콘" width="30" height="30" />
          <span className="text-xl">구글 계정으로 로그인</span>
        </button>
      </div>
    </div>
  );
}
