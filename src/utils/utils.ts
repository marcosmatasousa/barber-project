import { BookingBody } from "../types/booking";

export function convertToTimestamp(date: BookingBody): number {
  const { day, month, year, hour, minutes } = date;
  return new Date(year, month - 1, day, hour, minutes).getTime();
}

export function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(year, month - 1, day);

  return (
    year === date.getFullYear() &&
    month - 1 === date.getMonth() &&
    day === date.getDate() &&
    date > new Date()
  );
}
