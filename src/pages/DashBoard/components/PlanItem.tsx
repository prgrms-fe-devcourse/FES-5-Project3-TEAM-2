import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import dragIcon from "@/assets/icons/drag_indicator_icon.png";
import deleteIcon from "@/assets/icons/delete_icon.png";
import editIcon from "@/assets/icons/edit_icon.png";
import confirmIcon from "@/assets/icons/confirm_icon.png";
import { usePlanStore } from "../store/planStore";
import { usePresenceStore } from "../store/presenceStore";

interface Props {
  id: string;
  title: string;
  duration: number;
  address: string | null;
  sort_order: string;
  displayIndex: number;
}

function PlanItem({ id, title, duration, displayIndex }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const deletePlan = usePlanStore((s) => s.deletePlanItem);
  const editingItemIds = usePlanStore((s) => s.editingItemIds);
  const addEditingItem = usePlanStore((s) => s.addEditingItem);
  const removeEditingItem = usePlanStore((s) => s.removeEditingItem);
  const confirmEditItem = usePlanStore((s) => s.confirmEditItem);

  const myProfile = usePresenceStore((s) => s.myProfile);

  // ✅ 현재 아이템 수정자 찾기
  const editor = editingItemIds.find((e) => e.itemId === id);
  const isEditingByMe = editor?.userId === myProfile?.id;
  const isEditingByOther = editor && editor.userId !== myProfile?.id;

  const [tempTitle, setTempTitle] = useState(title);
  const [tempDuration, setTempDuration] = useState(duration);

  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  return (
    <li ref={setNodeRef} style={style}>
      <article
        className={`h-[60px] pr-2 flex items-center gap-2 rounded-[10px] border-2 font-extrabold ${
          isEditingByMe
            ? "bg-white opacity-80 border-primary"
            : isEditingByOther
              ? "bg-gray-100 opacity-60 border-gray-300"
              : "bg-white border-secondary"
        }`}
      >
        <img
          src={dragIcon}
          className="size-10 cursor-grab active:cursor-grabbing"
          draggable={false}
          {...attributes}
          {...listeners}
        />

        <span className="shrink-0 text-2xl text-primary">{displayIndex}</span>

        {isEditingByMe ? (
          // ✅ 내가 수정 중일 때
          <>
            <input
              className="border px-2 py-1 rounded text-sm"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
            />
            <input
              type="number"
              className="border px-2 py-1 rounded text-sm w-20"
              value={tempDuration}
              onChange={(e) => setTempDuration(Number(e.target.value))}
            />
            <img
              src={confirmIcon}
              className="size-6 cursor-pointer"
              onClick={() =>
                confirmEditItem(id, {
                  title: tempTitle,
                  duration: tempDuration,
                })
              }
            />
            <button
              className="text-xs text-red-500 ml-2"
              onClick={() => removeEditingItem(id)}
            >
              취소
            </button>
          </>
        ) : isEditingByOther ? (
          // ✅ 다른 사람이 수정 중일 때
          <p className="text-1 text-red-500">
            지금 {editor.userName}님이 수정 중...
          </p>
        ) : (
          // ✅ 아무도 수정 안 할 때
          <>
            <p className="font-extrabold">{title}</p>
            <div className="ml-auto flex items-center gap-2">
              <p className="text-lg text-primary">
                {hours > 0 && `${hours}시간 `}
                {minutes > 0 && `${minutes}분`}
                {hours === 0 && minutes === 0 && "0분"}
              </p>
              <img
                src={editIcon}
                className={`size-6 cursor-pointer ${
                  editingItemIds.some((e) => e.userId === myProfile?.id)
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={() => {
                  // 내가 이미 다른 아이템을 수정 중이면 막기
                  if (editingItemIds.some((e) => e.userId === myProfile?.id)) {
                    alert("이미 수정 중인 일정이 존재합니다.");
                    return;
                  }
                  addEditingItem(id);
                }}
              />
              <img
                src={deleteIcon}
                className="size-6 cursor-pointer"
                onClick={() => deletePlan(id)}
              />
            </div>
          </>
        )}
      </article>
    </li>
  );
}

export default PlanItem;
