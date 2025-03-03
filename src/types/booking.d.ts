import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface BookingBody {
  day: number;
  year: number;
  month: number;
  hour: number;
  minutes: number;
  barberId: number;
  clientId: number;
  serviceId: number;
  payload?: JwtPayload;
}

export interface deletePathParams {
  appointmentId: string;
}
