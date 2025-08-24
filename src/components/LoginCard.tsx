

import { supabase } from "../lib/supabaseClient";


export default function LoginCard() {

const handleGoogleLogin = async () => {
  const redirectTo = `${window.location.origin}/auth/callback`;
  console.log("[login] redirectTo =", redirectTo);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      scopes: "openid email profile",
      redirectTo,
    },
  });

  if (error) {
    console.error("Google login error:", error.message);
    alert("로그인 중 오류가 발생했습니다.");
  }
};


  return (
    <div className="w-[580px] h-[700px] mt-[120px] mr-[200px]
                    bg-secondary/10 border-2 border-secondary rounded-[18px] shadow-[4px_4px_4px_rgba(0,0,0,0.25)] p-8
                    flex flex-col items-center justify-center"
                  >
      <div className="w-full flex flex-col items-center justify-center mb-6">
        <div>
          <img
          src="logo.svg"
          alt="로고 이미지"
          className="block mx-auto w-[140px] h-[60px]"
          />
          <h2 className="text-6xl text-primary tracking-wide mb-[48px]">
            Planmingo
          </h2>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-2xl font-extrabold mb-[48px]">Login</h3>
          <p className="text-lg text-neutral-600 mt-1 mb-[48px]">
            로그인하고 Planmingo의 <br /> 다양한 서비스를 이용해 보세요.
          </p>
        </div>

        <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-5 py-5
                    bg-white border-2 border-secondary rounded-lg shadow-sm
                    hover:bg-rose-50 transition text-sm text-neutral-700 cursor-pointer"
        >
          <img
          src="google.svg"
          alt="구글 아이콘"
          width="30" height="30"
          />
          <span className="text-xl">구글 계정으로 로그인</span>
        </button>
      </div>
    </div>
  )
}
