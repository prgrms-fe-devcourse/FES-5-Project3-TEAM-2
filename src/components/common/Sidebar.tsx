import { NavLink } from "react-router-dom";
import { useGroupStore } from "@/store/groupStore";

import logo from "@/assets/logo.png";
import defaultProfile from "@/assets/default-profile.png";
import GroupIcon from "@/assets/icon/group.svg?react";
import calendar from "@/assets/icon/calendar.svg";
import money from "@/assets/icon/money.svg";
import photo from "@/assets/icon/photo.svg";
import logout from "@/assets/icon/logout.svg";

const link = ({ isActive }: { isActive: boolean }) =>
  [
    "flex flex-row items-center gap-5  w-full px-3 py-2 rounded-lg text-sm font-semibold transition",
    isActive
      ? "bg-primary text-white shadow-sm"
      : "text-black hover:bg-primary hover:text-white",
  ].join(" ");

export default function Sidebar() {
  const currentGroup = useGroupStore((s) => s.currentGroup);

  return (
    <aside className="w-[248px] min-h-screen shadow-[0_4px_12px_rgba(0,0,0,0.15)] bg-white flex flex-col px-5 pt-6 pb-4">
      {/* 로고 */}
      <img src={logo} alt="로고" className="w-[208px] pb-[50px]" />

      {/* 프로필 */}
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 border border-gray-200 rounded-full grid place-items-center">
          <img
            src={defaultProfile}
            alt="기본 프로필 이미지"
          />
        </div>
        <div className="mt-2 text-black text-2 font-sans font-semibold">user</div>
        <div className="mt-2 text-1 text-gray-400 font-sans font-medium">
          {currentGroup ? <>현재 그룹 : <span className="font-semibold">{currentGroup.name}</span></> : "현재 그룹 없음"}
        </div>
      </div>

      <hr className="my-4 border-slate-200" />

      {/* 메뉴 */}
      <nav className="space-y-1">
        <NavLink to="/groups" className={link}>
          <GroupIcon className="w-5 h-5" />
          <span className="text-1 font-sans font-semibold">그룹 관리</span>
        </NavLink>

        {currentGroup ? (
          <>
            <NavLink end to={`/g/${currentGroup.id}`} className={link}>
              <img src={calendar} alt="달력 아이콘" className="w-5 h-5" />
              <span className="text-1 font-sans font-semibold">대시보드</span>
            </NavLink>
            <NavLink to={`/g/${currentGroup.id}/budget`} className={link}>
              <img src={money} alt="예산 아이콘" className="w-5 h-5" />
              <span className="text-1 font-sans font-semibold">예산 관리</span>
            </NavLink>
            <NavLink to={`/g/${currentGroup.id}/album`} className={link}>
              <img src={photo} alt="앨범 아이콘" className="w-5 h-5" />
              <span className="text-1 font-sans font-semibold">앨범</span>
            </NavLink>
          </>
        ) : (
          <>
          
          </>
        )}
      </nav>

      <div className="flex-1" />

      <button className="flex items-center gap-2 text-gray-200 hover:gray-400 transition">
``      <img src={logout} alt="로그아웃 아이콘" className="w-5 h-5" />
        <span className="font-medium">로그아웃</span>
      </button>
    </aside>
  );
}
