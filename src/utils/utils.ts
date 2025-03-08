import { BookingBody } from "../types/booking";

export function convertToTimestamp(booking: BookingBody): number {
  const { date, time } = booking;
  return new Date(`${date}T${time}:00.000Z`).getTime();
}

export function isValidDate(dateString: string): boolean {
  const dateTime = new Date(dateString);

  return dateTime > new Date();
}
