import type { Schedule } from "../api/mapSchedule";

export function groupSchedulesByLocation(schedules: Schedule[]) {
  const groups = new Map<string, Schedule[]>();
  schedules.forEach((schedule) => {
    if (!schedule.latitude || !schedule.longitude) return;
    const locationKey = `${schedule.latitude},${schedule.longitude}`;

    if (!groups.has(locationKey)) {
      groups.set(locationKey, []);
    }
    groups.get(locationKey)!.push(schedule);
  });
  return groups;
}
