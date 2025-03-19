import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/authRequest";
import { DeletePathParams, RescheduleBody } from "../types/booking";
import prisma from "../lib/prisma";

export async function checkBarberAvailabilityForReschedule(
  req: AuthRequest<DeletePathParams, {}, RescheduleBody>,
  res: Response,
  next: NextFunction
) {
  const { date, time, barberId } = req.body;
  const { appointmentId } = req.params;
  try {
    const appointment = await prisma.appointments.findUnique({
      where: { id: parseInt(appointmentId) },
    });

    let newDateTime = appointment?.dateTime;
    if (date || time) {
      const originalDateTime = appointment?.dateTime;
      newDateTime = new Date(
        `${date ? date : originalDateTime?.toISOString().slice(0, 10)}T${
          time ? time : originalDateTime?.toISOString().slice(11, 16)
        }:00.000Z`
      );
    }

    const isBarberWorking = await prisma.barberAvailability.findFirst({
      where: {
        barberId: barberId || appointment?.barberId,
        startTime: { lte: newDateTime },
        endTime: { gte: newDateTime },
      },
    });

    const dateResult = date ? date : newDateTime?.toISOString().split("T")[0];
    const timeResult = time
      ? time
      : newDateTime?.toISOString().split("T")[1].substring(0, 5);

    if (!isBarberWorking) {
      res.status(400).json({
        error: `Barber not available for ${dateResult}, ${timeResult}`,
      });
      return;
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
