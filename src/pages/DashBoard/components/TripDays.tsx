import { useState, useEffect } from "react";
import { BsFillCaretLeftFill, BsFillCaretRightFill } from "react-icons/bs";
import { usePlanStore } from "../store/planStore";

function TripDays() {
  const tripDaysData = usePlanStore((state) => state.tripDays);
  const setSelectedDay = usePlanStore((state) => state.setSelectedDay);

  // 처음엔 인덱스 3(=4번째)을 중앙으로 시작
  const [centerIndex, setCenterIndex] = useState(3);

  // 항상 7일만 slice
  const visibleDays = tripDaysData.slice(centerIndex - 3, centerIndex + 4);

  // 항상 가운데 날짜 선택
  useEffect(() => {
    if (visibleDays[3]) {
      setSelectedDay(visibleDays[3].fullDate);
    }
  }, [visibleDays, setSelectedDay]);

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

      <div className="flex w-full max-w-3xl justify-between transition-all duration-300 ease-in-out px-4 ">
        {visibleDays.map(({ dayOfTheWeek, date, fullDate }, idx) => {
          const isCenter = idx === 3;
          return (
            <div
              key={fullDate}
              className={`flex flex-col items-center justify-center pt-1 rounded-[20px] space-y-[-7px]
                ${isCenter ? "bg-primary w-14" : "w-14"}`}
            >
              <p
                className={`text-1 font-bold select-none ${
                  isCenter ? "text-white" : "text-gray-400"
                }`}
              >
                {dayOfTheWeek}
              </p>
              <p
                className={`text-3 font-bold select-none ${
                  isCenter ? "text-white" : "text-gray-200"
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
