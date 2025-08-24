import { useState } from 'react'
import slideIcon from '@/assets/icons/slide_icon.png' 

function TripDays() { 
  const [startIndex, setStartIndex] = useState(0)

  const tripDaysData = [ 
    { 
      dayOfTheWeek: "SUN", 
      date: 17 
    }, 
    { 
      dayOfTheWeek: "MON", 
      date: 18 
    }, 
    { 
      dayOfTheWeek: "TUE", 
      date: 19 
    }, 
    { 
      dayOfTheWeek: "WED", 
      date: 20 
    }, 
    { 
      dayOfTheWeek: "THU", 
      date: 21 
    }, 
    { 
      dayOfTheWeek: "FRI", 
      date: 22 
    }, 
    { 
      dayOfTheWeek: "SAT", 
      date: 23 
    },
    { 
      dayOfTheWeek: "MON", 
      date: 24 
    }, 
    { 
      dayOfTheWeek: "TUE", 
      date: 25 
    }, 
    { 
      dayOfTheWeek: "WED", 
      date: 26 
    }, 
  ]

  // 현재 보여줄 7일 데이터
  const visibleDays = tripDaysData.slice(startIndex, startIndex + 7)
  
  // 이전 버튼 클릭
  const handlePrevious = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1)
    }
  }
  
  // 다음 버튼 클릭
  const handleNext = () => {
    if (startIndex < tripDaysData.length - 7) {
      setStartIndex(startIndex + 1)
    }
  } 

  return ( 
    <div className='flex flex-row justify-between -mx-3'> 
      <button 
        type="button" 
        onClick={handlePrevious}
        disabled={startIndex === 0}
        className={startIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      > 
        <img src={slideIcon} className="scale-x-[-1]"/> 
      </button> 

      { 
        visibleDays.map(({dayOfTheWeek, date}, index) => ( 
          <div 
            key={startIndex + index}
            className={`flex flex-col items-center space-y-[-4px] px-2 py-1.5 rounded-[20PX] ${
              index === 3 ? 'bg-primary' : ''
            }`}
          > 
            <p className={`text-[10px] font-bold ${index === 3 ? 'text-white' : 'text-gray-400'}`}>
              {dayOfTheWeek}
            </p> 
            <p className={`text-[28px] font-bold ${index === 3 ? 'text-white' : 'text-gray-200'}`}>
              {date}
            </p> 
          </div> 
        )) 
      } 

      <button 
        type="button"
        onClick={handleNext}
        disabled={startIndex >= tripDaysData.length - 7}
        className={startIndex >= tripDaysData.length - 7 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      > 
        <img src={slideIcon}/> 
      </button> 
    </div>  
  ) 
} 

export default TripDays