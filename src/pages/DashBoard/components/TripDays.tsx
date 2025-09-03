// TripDays.tsx
import { useState, useEffect, useCallback } from "react";
import { BsFillCaretLeftFill, BsFillCaretRightFill } from "react-icons/bs";
import { usePlanStore } from "../store/planStore";
import { usePresenceStore } from "../store/presenceStore";
import { useGroupStore } from "../store/groupStore";
import { supabase } from "@/lib/supabaseClient";

function TripDays() {
  // ─────────────────────────────
  // Store 상태
  const tripDays = usePlanStore((s) => s.tripDays);
  const setSelectedDay = usePlanStore((s) => s.setSelectedDay);
  const editingItemIds = usePlanStore((s) => s.editingItemIds);
  const removeEditingItem = usePlanStore((s) => s.removeEditingItem);

  // ─────────────────────────────
  // 로컬 상태
  const [centerIndex, setCenterIndex] = useState(3); // 처음 4번째(=인덱스 3)를 중앙으로

  // 항상 7일만 보여줌
  const visibleDays = tripDays.slice(centerIndex - 3, centerIndex + 4);

  // tripDays가 바뀌면 중앙 초기화
  useEffect(() => {
    setCenterIndex(3);
  }, [tripDays]);

  // ─────────────────────────────
  // 수정 중인 아이템 정리
  const clearMyEditingItems = useCallback(() => {
    const myProfile = usePresenceStore.getState().myProfile;
    const group = useGroupStore.getState().group;
    if (!myProfile || !group) return;

    const myEditingItems = editingItemIds.filter(
      (item) => item.userId === myProfile.id
    );

    myEditingItems.forEach((item) => {
      // Broadcast
      supabase.channel(group.id).send({
        type: "broadcast",
        event: "edit-end",
        payload: { itemId: item.itemId, userId: myProfile.id },
      });

      // 로컬 상태에서 제거
      removeEditingItem(item.itemId);
    });
  }, [editingItemIds, removeEditingItem]);

  // 중앙 날짜가 바뀌면 선택 + 내 편집 아이템 해제
  useEffect(() => {
    if (!visibleDays[3]) return;

    const newSelectedDay = visibleDays[3].fullDate;
    const currentSelectedDay = usePlanStore.getState().selectedDay;

    if (newSelectedDay !== currentSelectedDay) {
      clearMyEditingItems();
    }
    setSelectedDay(newSelectedDay);
  }, [visibleDays, setSelectedDay, clearMyEditingItems]);

  // ─────────────────────────────
  // 네비게이션
  const handlePrevious = () => {
    if (centerIndex > 3) setCenterIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (centerIndex < tripDays.length - 4) setCenterIndex((prev) => prev + 1);
  };

  const handleDayClick = (clickedIdx: number) => {
    if (clickedIdx === 3) return; // 이미 중앙인 날짜는 무시
    const targetCenterIndex = centerIndex + (clickedIdx - 3);

    if (targetCenterIndex >= 3 && targetCenterIndex <= tripDays.length - 4) {
      setCenterIndex(targetCenterIndex);
    }
  };

  // 실제 여행일 판별 (앞뒤 3일 제외)
  const isTravelDay = (globalIndex: number) =>
    globalIndex >= 3 && globalIndex < tripDays.length - 3;

  // ─────────────────────────────
  // 렌더링
  return (
    <div className="flex w-full flex-row items-center justify-between">
      {/* 이전 버튼 */}
      <button
        type="button"
        onClick={handlePrevious}
        disabled={centerIndex <= 3}
        className={
          centerIndex <= 3
            ? "cursor-not-allowed text-gray-200"
            : "cursor-pointer text-primary"
        }
      >
        <BsFillCaretLeftFill className="size-8" />
      </button>

      {/* 날짜 리스트 */}
      <div className="flex w-full max-w-3xl justify-between px-4">
        {visibleDays.map(({ dayOfTheWeek, date, fullDate }, idx) => {
          const isCenter = idx === 3;
          const globalIndex = centerIndex - 3 + idx;
          const clickable = isTravelDay(globalIndex);

          return (
            <div
              key={fullDate}
              onClick={() => clickable && handleDayClick(idx)}
              className={`flex w-14 flex-col items-center justify-center space-y-[-7px] rounded-[20px] pt-1
                ${isCenter ? "bg-primary" : ""}
                ${clickable ? "cursor-pointer" : "cursor-not-allowed"}`}
            >
              <p
                className={`text-1 font-bold select-none ${
                  isCenter
                    ? "text-white"
                    : clickable
                    ? "text-black"
                    : "text-gray-400"
                }`}
              >
                {dayOfTheWeek}
              </p>
              <p
                className={`text-3 font-bold select-none ${
                  isCenter
                    ? "text-white"
                    : clickable
                    ? "text-black"
                    : "text-gray-200"
                }`}
              >
                {date}
              </p>
            </div>
          );
        })}
      </div>

      {/* 다음 버튼 */}
      <button
        type="button"
        onClick={handleNext}
        disabled={centerIndex >= tripDays.length - 4}
        className={
          centerIndex >= tripDays.length - 4
            ? "cursor-not-allowed text-gray-200"
            : "cursor-pointer text-primary"
        }
      >
        <BsFillCaretRightFill className="size-8" />
      </button>
    </div>
  );
}

export default TripDays;
