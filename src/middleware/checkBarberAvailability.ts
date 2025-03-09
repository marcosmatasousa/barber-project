import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/authRequest";
import {
  BookingBody,
  DeletePathParams,
  RescheduleBody,
} from "../types/booking";
import { convertToTimestamp } from "../utils/utils";
import prisma from "../lib/prisma";

export async function checkBarberAvailability(
  req:
    | AuthRequest<{}, {}, BookingBody>
    | AuthRequest<DeletePathParams, {}, RescheduleBody>,
  res: Response,
  next: NextFunction
) {
  console.log(req.body);

  const { date, time, barberId } = req.body;
  const timestamp = convertToTimestamp(date as string, time as string);

  const isBarberWorking = await prisma.barberAvailability.findFirst({
    where: {
      barberId: barberId,
      startTime: { lte: new Date(timestamp) },
      endTime: { gte: new Date(timestamp) },
    },
  });

  if (!isBarberWorking) {
    res
      .status(400)
      .json({ error: `Barber not available for ${date}, ${time}` });
    return;
  }

  next();
}
