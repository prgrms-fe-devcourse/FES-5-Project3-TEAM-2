import cardAdd from "@/assets/icons/cardAdd.svg";
import type { Group } from "../types/groups";
import GroupCard from "./GroupCard";

export default function GroupList({
  groups,
  onAdd,
  creating,
}: {
  groups: Group[];
  onAdd: () => void;
  creating: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-3 py-5">
      {groups.map((g) => (
        <GroupCard key={g.id} g={g} />
      ))}

      {/* 그룹카드 추가 */}
      <button
        type="button"
        onClick={onAdd}
        disabled={creating}
        className="w-full max-w-[480px] aspect-[20/9] bg-secondary rounded-2xl shadow-[4px_4px_4px_rgba(0,0,0,0.25)] cursor-pointer"
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <img src={cardAdd} alt="그룹 카드 추가" />
          <p className="text-5 font-extrabold text-white">
            {creating ? "생성 중..." : "그룹 추가"}
          </p>
        </div>
      </button>
    </div>
  );
}
