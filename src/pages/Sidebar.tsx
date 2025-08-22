import { NavLink } from "react-router-dom";
import { useGroupStore } from "@/store/groupStore";

export default function Sidebar() {
  const currentGroup = useGroupStore((s) => s.currentGroup);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md text-sm
     ${isActive ? "bg-rose-500 text-white" : "text-slate-700 hover:bg-slate-200"}`;

  return (
    <aside className="bg-white border-r p-4 min-h-screen w-[240px]">
      <div className="mb-6 text-xl font-bold">Plammingo</div>
      <nav className="space-y-1">
        <NavLink to="/groups" className={linkCls}>그룹 관리</NavLink>

        {currentGroup && (
          <>
            <NavLink end to={`/g/${currentGroup.id}`} className={linkCls}>대시보드</NavLink>
            <NavLink to={`/g/${currentGroup.id}/budget`} className={linkCls}>예산</NavLink>
            <NavLink to={`/g/${currentGroup.id}/album`} className={linkCls}>앨범</NavLink>
          </>
        )}
      </nav>

      <div className="mt-6 text-xs text-slate-500">
        {currentGroup ? `현재 그룹: ${currentGroup.name}` : "그룹을 선택하세요"}
      </div>
    </aside>
  );
}
