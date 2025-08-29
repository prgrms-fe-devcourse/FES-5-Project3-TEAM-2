export interface TripDay {
  dayOfTheWeek: string
  date: number
  fullDate: string // YYYY-MM-DD format
}

function toYmd(date: Date): string {
  const d = new Date(date)
  d.setHours(12, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

function addDays(base: Date, diff: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + diff)
  return d
}

export function generateTripDays(start: string, end: string): TripDay[] {
  const startDate = new Date(start)
  const endDate = new Date(end)

  // 앞뒤 3일씩 확장
  const paddedStart = addDays(startDate, -3)
  const paddedEnd = addDays(endDate, 3)

  const result: TripDay[] = []
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

  // 날짜 루프
  for (let day = new Date(paddedStart); day <= paddedEnd; day.setDate(day.getDate() + 1)) {
    const labelDate = new Date(day)
    const fullDate = toYmd(labelDate)

    result.push({
      dayOfTheWeek: dayNames[labelDate.getDay()],
      date: labelDate.getDate(),
      fullDate
    })
  }

  return result
}