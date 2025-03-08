import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface BookingBody {
  date: string;
  time: string;
  barberId: number;
  clientId: number;
  services: Array;
  payload?: JwtPayload;
}

export interface RescheduleBody {
  date?: string;
  time?: string;
  barberId?: number;
}
export interface DeletePathParams {
  appointmentId: string;
}
