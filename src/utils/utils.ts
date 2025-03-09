import { BookingBody } from "../types/booking";

export function convertToTimestamp(date: string, time: string): number {
  return new Date(`${date}T${time}:00.000Z`).getTime();
}

export function isValidDate(dateString: string): boolean {
  const dateTime = new Date(dateString);

  return dateTime > new Date();
}
