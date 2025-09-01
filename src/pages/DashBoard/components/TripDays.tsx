import { useState, useEffect, useCallback } from "react";
import { BsFillCaretLeftFill, BsFillCaretRightFill } from "react-icons/bs";
import { usePlanStore } from "../store/planStore";
import { usePresenceStore } from "../store/presenceStore";
import { useGroupStore } from "../store/groupStore";
import { supabase } from "@/lib/supabaseClient";

function TripDays() {
  const tripDaysData = usePlanStore((state) => state.tripDays);
  const setSelectedDay = usePlanStore((state) => state.setSelectedDay);
  const editingItemIds = usePlanStore((state) => state.editingItemIds);
  const removeEditingItem = usePlanStore((state) => state.removeEditingItem);
  
  // 처음엔 인덱스 3(=4번째)을 중앙으로 시작
  const [centerIndex, setCenterIndex] = useState(3);

  // 항상 7일만 slice
  const visibleDays = tripDaysData.slice(centerIndex - 3, centerIndex + 4);

  // 선택된 날짜가 바뀔 때 수정 중인 아이템 정리
  const clearMyEditingItems = useCallback(() => {
    const myProfile = usePresenceStore.getState().myProfile;
    const group = useGroupStore.getState().group;
    if (!myProfile || !group) return;

    const myEditingItems = editingItemIds.filter(item => item.userId === myProfile.id);
    
    if (myEditingItems.length > 0) {
      // 각 수정 중인 아이템에 대해 브로드캐스트 전송
      myEditingItems.forEach(item => {
        supabase.channel(group.id).send({
          type: "broadcast",
          event: "edit-end",
          payload: { itemId: item.itemId, userId: myProfile.id },
        });
        
        // 로컬 상태에서 제거
        removeEditingItem(item.itemId);
      });
    }
  }, [editingItemIds, removeEditingItem]);

  // 항상 가운데 날짜 선택
  useEffect(() => {
    if (visibleDays[3]) {
      // 날짜가 실제로 바뀔 때만 수정 중인 아이템 정리
      const newSelectedDay = visibleDays[3].fullDate;
      const currentSelectedDay = usePlanStore.getState().selectedDay;
      
      if (newSelectedDay !== currentSelectedDay) {
        clearMyEditingItems();
      }
      
      setSelectedDay(newSelectedDay);
    }
  }, [visibleDays, setSelectedDay, clearMyEditingItems]);

  const handlePrevious = () => {
    if (centerIndex > 3) {
      setCenterIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (centerIndex < tripDaysData.length - 4) {
      setCenterIndex((prev) => prev + 1);
    }
  };

  const handleDayClick = (clickedIndex: number) => {
    // 가운데(인덱스 3)는 이미 선택된 상태이므로 무시
    if (clickedIndex === 3) return;
    
    // 클릭한 날짜가 가운데로 오도록 centerIndex 조정
    const targetCenterIndex = centerIndex + (clickedIndex - 3);
    
    // 범위 체크
    if (targetCenterIndex >= 3 && targetCenterIndex <= tripDaysData.length - 4) {
      setCenterIndex(targetCenterIndex);
    }
  };

  // 실제 여행 기간인지 확인 (앞뒤 3개 제외)
  const isTravelDay = (globalIndex: number) => {
    return globalIndex >= 3 && globalIndex < tripDaysData.length - 3;
  };

  return (
    <div className="flex flex-row justify-between items-center w-full">
      <button
        type="button"
        onClick={handlePrevious}
        disabled={centerIndex <= 3}
        className={
          centerIndex <= 3
            ? "text-gray-200 cursor-not-allowed"
            : "text-primary cursor-pointer"
        }
      >
        <BsFillCaretLeftFill className="size-8" />
      </button>

      <div className="flex w-full max-w-3xl justify-between px-4">
        {visibleDays.map(({ dayOfTheWeek, date, fullDate }, idx) => {
          const isCenter = idx === 3;
          const globalIndex = centerIndex - 3 + idx; // 전체 배열에서의 실제 인덱스
          const isClickable = isTravelDay(globalIndex);
          
          return (
            <div
              key={fullDate}
              onClick={() => isClickable && handleDayClick(idx)}
              className={`flex flex-col items-center justify-center pt-1 rounded-[20px] space-y-[-7px]
                ${isCenter ? "bg-primary w-14" : "w-14"}
                ${isClickable ? "cursor-pointer" : "cursor-not-allowed"}`}
            >
              <p
                className={`text-1 font-bold select-none ${
                  isCenter 
                    ? "text-white" 
                    : isClickable 
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
                    : isClickable 
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

      <button
        type="button"
        onClick={handleNext}
        disabled={centerIndex >= tripDaysData.length - 4}
        className={
          centerIndex >= tripDaysData.length - 4
            ? "text-gray-200 cursor-not-allowed"
            : "text-primary cursor-pointer"
        }
      >
        <BsFillCaretRightFill className="size-8" />
      </button>
    </div>
  );
}

export default TripDays;