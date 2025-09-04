import google from "@/assets/icons/google.svg";
import logo from "@/assets/logo.png";
import { useState } from "react";
import { FaPlane } from "react-icons/fa";
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
    alert("로그인 중 문제가 발생했습니다.");
    setLoading(false);
  }
};


  return (
    <div
      className="w-full max-w-[550px] h-auto
  lg:max-w-[360px] xl:max-w-[480px] 2xl:max-w-[580px]
  mt-20 lg:mt-[120px]
  bg-gradient-to-br from-white via-rose-50 to-pink-50
  border-2 border-secondary
  rounded-[12px] shadow-2xl p-0
  flex flex-col relative overflow-hidden"
    >
      {/* 항공사 헤더 */}
      <div
        className="w-full h-12 bg-gradient-to-r from-secondary/80 via-secondary to-secondary/90
                  flex items-center justify-start px-6 relative"
      >
        <div className="text-white">
          <div className="font-bold text-xl tracking-wider">ACCESS PASS</div>
        </div>
      </div>

      {/* 메인 티켓 영역 */}
      <div className="p-6 pb-6">
        {/* 로고 */}
        <div className="w-full flex justify-center mb-4">
          <img
            src={logo}
            alt="로고 이미지"
            className="block mx-auto w-full max-w-[200px] sm:max-w-[300px]"
          />
        </div>

        {/* 항로 정보 */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">FROM</div>
            <div className="font-bold text-xl text-secondary">ME</div>
          </div>
          <div className="flex items-center justify-center relative">
            <div className="w-full border-t-2 border-dashed border-secondary relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <FaPlane className="text-secondary text-xl" />
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">TO</div>
            <div className="font-bold text-xl text-secondary">WE</div>
          </div>
        </div>

        {/* 항공편 정보 */}
        <div className="grid grid-cols-4 gap-3 mb-4 p-3 bg-rose-50/50 rounded-lg border border-secondary/20">
          <div className="text-center">
            <div className="text-xs text-gray-500">FLIGHT</div>
            <div className="font-bold text-xs text-gray-800">PM001</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">DATE</div>
            <div className="font-bold text-xs text-gray-800">TODAY</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">GATE</div>
            <div className="font-bold text-xs text-gray-800">START</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">SEAT</div>
            <div className="font-bold text-xs text-gray-800">01A</div>
          </div>
        </div>

        {/* 탑승 안내 */}
        <div className="text-center mb-4 px-4">
          <div className="text-xs text-gray-500 mb-2">TRIP GUIDE</div>
          <p className="text-sm text-gray-700">
            구글 계정으로 로그인하고
            <br />
            팀과 여행을 계획하세요.
          </p>
        </div>

        {/* 구글 로그인 버튼 */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-5 py-3
      bg-white border-2 border-secondary rounded-xl shadow-sm
      transform hover:scale-105 transition-all duration-200
      text-lg font-semibold cursor-pointer text-neutral-700
      disabled:opacity-60 disabled:cursor-default disabled:transform-none"
        >
          <img src={google} alt="구글 아이콘" width="28" height="28" />
          <span>구글 계정으로 로그인</span>
        </button>
      </div>

      {/* 바코드 */}
      <div className="w-full flex justify-center items-center px-4 py-2 bg-rose-50">
        <div className="flex gap-[1px]">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="bg-secondary/60"
              style={{
                width: Math.random() > 0.6 ? "2px" : "1px",
                height: `${Math.random() * 16 + 8}px`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* 절취선 */}
      <div className="relative">
        <div className="w-full border-t-2 border-dashed border-secondary/50"></div>
        {/* 좌우 반원 절취 부분 */}
        <div className="absolute -left-4 -top-4 w-8 h-8 bg-white rounded-full border-2 border-secondary/30"></div>
        <div className="absolute -right-4 -top-4 w-8 h-8 bg-white rounded-full border-2 border-secondary/30"></div>
      </div>

      {/* 하단 스텁 */}
      <div className="p-3 bg-gradient-to-r from-rose-50/80 to-pink-50/80">
        <div className="flex justify-between items-center">
          <div className="text-left">
            <div className="text-xs text-gray-500">FLIGHT PM001</div>
            <div className="font-bold text-sm text-gray-800">ME → WE</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">SEAT</div>
            <div className="font-bold text-base text-secondary">01A</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">PLANMINGO</div>
            <div className="font-bold text-sm text-gray-800">ACCESS</div>
          </div>
        </div>
      </div>
    </div>
  );
}
