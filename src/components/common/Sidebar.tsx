import { useGroupStore } from "@/store/groupStore";
import { NavLink, useNavigate, useParams } from "react-router-dom";

import defaultProfile from "@/assets/defaultprofile.svg";
import CalendarIcon from "@/assets/icons/calendar.svg?react";
import GroupIcon from "@/assets/icons/group.svg?react";
import logoutIcon from "@/assets/icons/logout.svg";
import MoneyIcon from "@/assets/icons/money.svg?react";
import PhotoIcon from "@/assets/icons/photo.svg?react";
import logo from "@/assets/logo.png";
import { usePresenceStore } from "@/pages/DashBoard/store/presenceStore";
import GroupMemberList from "@/pages/Group/components/GroupMemberList";
import useCurrentGroup from "@/pages/Group/hooks/useCurrentGroup";
import useCurrentProfile from "@/pages/Group/hooks/useCurrentProfile";
import { useGroupMembers } from "@/pages/Group/hooks/useGroupMembers";
import { useProfileStore } from "@/store/profileStore";
import { LogoutAlert } from "../Sweetalert";

const link = ({ isActive }: { isActive: boolean }) =>
  [
    "group flex flex-row items-center gap-5  w-full px-3 py-2 rounded-lg text-sm font-semibold transition",
    isActive
      ? "bg-primary text-white shadow-sm"
      : "text-black hover:bg-primary hover:text-white",
  ].join(" ");

export default function Sidebar() {
  useCurrentProfile(); // 사용자 프로필
  useCurrentGroup(); // 현재 참여한 그룹

  const navigate = useNavigate();

  const {profile} = useProfileStore();
  const currentGroup = useGroupStore((s) => s.currentGroup);

  const { members, loading } = useGroupMembers(currentGroup?.id);
  const onlineUserIds = usePresenceStore((s) => s.onlineUserIds);


  const {userId} = useParams<{userId:string}>();
  // groups/:userId
  const userBase = userId ? `/groups/${userId}` : null;
  // groups/:userId/g/:groupId
  const groupBase = currentGroup ? `${userBase}/g/${currentGroup.id}` : null;


  return (
    <aside className="w-[240px] min-h-screen shadow-[0_4px_12px_rgba(0,0,0,0.15)] bg-white flex flex-col px-5 pt-6 pb-4">
      {/* 로고 */}
      <img src={logo} alt="로고" className="w-[208px] pb-[50px]" />

      {/* 프로필 */}
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 border border-gray-200 rounded-full grid place-items-center">
          <img
            src={profile?.avatar_url ?? defaultProfile}
            alt="기본 프로필 이미지"
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = defaultProfile;
            }}
          />
        </div>
        <div className="mt-2 text-black text-2 font-sans font-semibold">{profile?.name ?? "Guest"}</div>
        <div className="mt-2 text-1 text-gray-400 font-sans font-medium">
          {currentGroup ? <>현재 그룹 : <span className="font-semibold">{currentGroup.name}</span></> : ""}
        </div>
      </div>

      <hr className="my-4 border-slate-200" />

      {/* 메뉴 */}
      <nav className="space-y-1">
        <NavLink end to={userBase ?? "/groups"} className={link}>
          {({ isActive }) => (
            <>
              <GroupIcon className={`w-5 h-5 ${isActive ? "text-white" : "text-primary"} group-hover:text-white`} />
              <span className="text-1 font-sans font-semibold">그룹 관리</span>
            </>
          )}
        </NavLink>

        {groupBase && (
          <>
            <NavLink end to={groupBase} className={link}>
              {({ isActive }) => (
                <>
                  <CalendarIcon className={`w-5 h-5 ${isActive ? "text-white" : "text-primary"} group-hover:text-white`} />
                  <span className="text-1 font-sans font-semibold">대시보드</span>
                </>
              )}
            </NavLink>
            <NavLink to={`${groupBase}/budget`} className={link}>
              {({ isActive }) => (
                <>
                  <MoneyIcon className={`w-5 h-5 ${isActive ? "text-white" : "text-primary"} group-hover:text-white`} />
                  <span className="text-1 font-sans font-semibold">예산 관리</span>
                </>
              )}
            </NavLink>
            <NavLink to={`${groupBase}/album`} className={link}>
              {({ isActive }) => (
                <>
                  <PhotoIcon className={`w-5 h-5 ${isActive ? "text-white" : "text-primary"} group-hover:text-white`} />
                  <span className="text-1 font-sans font-semibold">앨범</span>
                </>
              )}
            </NavLink>
          </>
        )}
      </nav>


      {currentGroup && (
        <>
          <hr className="my-4 border-slate-200" />
          <div className="max-h-[310px] overflow-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-transparent mb-3">
            <h3 className="mb-3 font-bold">그룹 멤버</h3>
            {loading ? (
              <p className="text-gray-400 text-sm">불러오는 중...</p>
            ) : (
              <GroupMemberList members={members} onlineUserIds={onlineUserIds} />
            )}
          </div>
        </>
      )}

      <div className="flex-1" />

      <button
      type="button"
      onClick={() => LogoutAlert(navigate)}
      className="flex items-center justify-center gap-2 mb-2 text-gray-200 hover:text-gray-400 transition cursor-pointer
                  disabled:opacity-60 disabled:cursor-default">
        <img src={logoutIcon} alt="로그아웃 아이콘" className="w-5 h-5" />
        <span className="font-medium">로그아웃</span>
      </button>
    </aside>
  );
}
