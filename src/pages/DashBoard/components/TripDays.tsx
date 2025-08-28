import { useState } from "react"
import slideIcon from "@/assets/icons/slide_icon.png"
import { usePlanStore } from "../store/planStore"

function TripDays() {
  const [startIndex, setStartIndex] = useState(0)

  const tripDaysData = usePlanStore((state) => state.tripDays)
  const selectedDay = usePlanStore((state) => state.selectedDay)
  const setSelectedDay = usePlanStore((state) => state.setSelectedDay)

  // 현재 보여줄 7일 데이터
  const visibleDays = tripDaysData.slice(startIndex, startIndex + 7)

  // 이전 버튼
  const handlePrevious = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1)
    }
  }

  // 다음 버튼
  const handleNext = () => {
    if (startIndex < tripDaysData.length - 7) {
      setStartIndex(startIndex + 1)
    }
  }

  return (
    <div className="flex flex-row justify-between -mx-3">
      <button
        type="button"
        onClick={handlePrevious}
        disabled={startIndex === 0}
        className={startIndex === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      >
        <img src={slideIcon} className="scale-x-[-1]" />
      </button>

      {visibleDays.map(({ dayOfTheWeek, date, fullDate }) => {
        const isSelected = selectedDay === fullDate // YYYY-MM-DD 비교

        return (
          <div
            key={fullDate}
            onClick={() => setSelectedDay(fullDate)}
            className={`flex flex-col items-center space-y-[-4px] px-2 py-1.5 rounded-[20px] cursor-pointer
              ${isSelected ? "bg-primary" : ""}`}
          >
            <p className={`text-[10px] font-bold ${isSelected ? "text-white" : "text-gray-400"}`}>
              {dayOfTheWeek}
            </p>
            <p className={`text-[28px] font-bold ${isSelected ? "text-white" : "text-gray-200"}`}>
              {date}
            </p>
          </div>
        )
      })}

      <button
        type="button"
        onClick={handleNext}
        disabled={startIndex >= tripDaysData.length - 7}
        className={
          startIndex >= tripDaysData.length - 7 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }
      >
        <img src={slideIcon} />
      </button>
    </div>
  )
}

export default TripDays
