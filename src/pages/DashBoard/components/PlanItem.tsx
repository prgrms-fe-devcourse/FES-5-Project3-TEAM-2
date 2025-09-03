import { useState, type MouseEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MdOutlineDragIndicator } from "react-icons/md";
import { FaRegCircleCheck, FaRegCircleXmark  } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import { RiDeleteBin5Line } from "react-icons/ri";
import { usePlanStore } from "../store/planStore";
import { usePresenceStore } from "../store/presenceStore";
import { useFocusStore } from "../store/focusStore";

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

  const setPlanItemId = useFocusStore((s) => s.setPlanItemId);

  // 현재 아이템 수정자 찾기
  const editor = editingItemIds.find((e) => e.itemId === id);
  const isEditingByMe = editor?.userId === myProfile?.id;
  const isEditingByOther = editor && editor.userId !== myProfile?.id;

  const [tempTitle, setTempTitle] = useState(title);
  const [tempDuration, setTempDuration] = useState(duration);

  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  // 클릭 애니메이션 상태 (내가 수정 중일 때는 비활성화)
  const canApplyClickEffect = !isEditingByMe;
  const [isClickEffectActive, setIsClickEffectActive] = useState(false);

  const handleMouseDown = () => {
    if (!canApplyClickEffect) return;
    setIsClickEffectActive(true);
  };

  const handleMouseUp = () => {
    setIsClickEffectActive(false);
  };

  const handleMouseLeave = () => {
    setIsClickEffectActive(false);
  };

  const stopPropagation = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      onClick={() => {
        if (isEditingByMe) return; // 수정 중에는 선택 전달 방지
        setPlanItemId(id);
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-150 ease-out transform-gpu ${isClickEffectActive ? "scale-95" : ""} ${canApplyClickEffect ? "cursor-pointer" : "cursor-default"}`}
    >
      <article
        className={`h-[50px] pr-2 flex items-center gap-2 rounded-[10px] border-2 font-extrabold shadow-md ${
          isEditingByMe
            ? "bg-white border-primary"
            : isEditingByOther
              ? "bg-gray-100 opacity-60 border-gray-300"
              : "bg-white border-secondary"
        }`}
      >
        <div onMouseDown={stopPropagation} onMouseUp={stopPropagation} onClick={stopPropagation}>
          <MdOutlineDragIndicator 
            className="size-8 shrink-0 cursor-grab active:cursor-grabbing text-gray-300 focus:outline-none"
            {...attributes}
            {...listeners}
          />
        </div>

        <span className="shrink-0 text-2xl text-primary">{displayIndex}</span>

        {isEditingByMe ? (
          // 내가 수정 중일 때
          <>
            <input
              className="border border-gray-300 focus:border-primary focus:outline-none focus:border-2 px-2 py-1 rounded text-sm w-full"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
            />
            <input
              type="number"
              className="border border-gray-300 focus:border-primary focus:outline-none focus:border-2 px-2 py-1 rounded text-sm w-18"
              value={tempDuration}
              onChange={(e) => setTempDuration(Number(e.target.value))}
            />
            
            <FaRegCircleCheck 
              className=" shrink-0 size-6 cursor-pointer text-primary"
              onClick={() =>
                confirmEditItem(id, {
                  title: tempTitle,
                  duration: tempDuration,
                })
              }
            />
            <FaRegCircleXmark 
              className="shrink-0 size-6 text-primary  cursor-pointer"
              onClick={() => removeEditingItem(id)}
            />
          </>
        ) : isEditingByOther ? (
          // 다른 사람이 수정 중일 때
          <p className="text-1 text-red-500">
            지금 {editor.userName}님이 수정 중...
          </p>
        ) : (
          // 아무도 수정 안 할 때
          <>
            <p className="font-extrabold">{title}</p>
            <div
              className="ml-auto flex items-center gap-2"
              onMouseDown={stopPropagation}
              onMouseUp={stopPropagation}
              onClick={stopPropagation}
            >
              <p className="text-lg text-primary">
                {hours > 0 && `${hours}시간 `}
                {minutes > 0 && `${minutes}분`}
                {hours === 0 && minutes === 0 && "0분"}
              </p>
              
              <MdEdit 
                className={`size-6 cursor-pointer text-gray-300 ${
                  editingItemIds.some((e) => e.userId === myProfile?.id)
                    ? "opacity-50 cursor-not-allowed text-gray-300"
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
              <RiDeleteBin5Line 
                className="size-6 cursor-pointer text-gray-300"
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
