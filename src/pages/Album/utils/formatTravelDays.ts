export const formatTravelDays = (startDay: string, endDay: string): string => {
  const startDate = new Date(startDay).toLocaleDateString();
  const endDate = new Date(endDay).toLocaleDateString();

  if (startDate === endDate) return startDate;
  return `${startDate} - ${endDate}`;
};
