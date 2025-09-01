import cardAdd from "@/assets/icons/cardAdd.svg";
import { useEffect, useState } from "react";

import type { Tables } from "@/types/supabase";
import GroupCard from "./GroupCard";

export default function GroupList({
  groups,
  onAdd,
  creating,
  onDelete,
}: {
  groups: Tables<'groups'>[];
  onAdd: () => void;
  creating: boolean;
  onDelete:(id:string) => Promise<void> | void;
}) {

  // 현재 열린 드롭다운의 카드 id
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [items, setItems] = useState<Tables<'groups'>[]>(groups);

  useEffect(() => {
    setItems(groups);
  },[groups]);

  useEffect(() => {
    const onDocClick = () => setOpenMenuId(null);

    document.addEventListener('click', onDocClick);
    return () => {
      document.removeEventListener('click', onDocClick);
    };
  },[]);

  const handleUpdated = (patch: {id:string, name?:string; start_day?:string, end_day?:string}) => {
    setItems((prev) => prev.map((item) => (item.id === patch.id ? {...item, ...patch} : item)));

  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-3 py-5">
      {items.map((g) => (
        <GroupCard
        key={g.id}
        g={g}
        openMenuId={openMenuId}
        setOpenMenuId={setOpenMenuId}
        onDelete={onDelete}
        onUpdated={handleUpdated}/>
      ))}

      {/* 그룹카드 추가 */}
      <button
      type="button"
      onClick={() => {
      setOpenMenuId(null);
      onAdd();
      }}
      disabled={creating}
      className="w-full max-w-[480px] bg-primary rounded-2xl shadow-[4px_4px_4px_rgba(0,0,0,0.25)] overflow-hidden cursor-pointer"
      >
        <div className="aspect-[20/9] w-full bg-primary flex flex-col items-center justify-center gap-4">
          <img src={cardAdd} alt="그룹 카드 추가" />
          <p className="text-5 font-extrabold text-white">
          {creating ? "생성 중..." : "그룹 추가"}
          </p>
        </div>
      </button>
    </div>
  );
}
