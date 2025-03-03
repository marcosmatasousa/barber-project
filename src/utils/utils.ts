import { BookingBody } from "../types/booking";

export function convertToTimestamp(date: BookingBody): number {
  const { day, month, year, hour, minutes } = date;
  return new Date(year, month - 1, day, hour, minutes).getTime();
}
