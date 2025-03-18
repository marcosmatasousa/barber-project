import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/authRequest";
import { BookingBody } from "../types/booking";
import { convertToTimestamp } from "../utils/utils";
import prisma from "../lib/prisma";

const isBarberAvailableOnDate = async ({
  date,
  time,
  barberId,
}: BookingBody) => {
  const timestamp = convertToTimestamp(date as string, time as string);
  try {
    const isBarberWorking = await prisma.barberAvailability.findFirst({
      where: {
        barberId: barberId,
        startTime: { lte: new Date(timestamp) },
        endTime: { gte: new Date(timestamp) },
      },
    });
    return isBarberWorking ? true : false;
  } catch (error) {
    console.log(error);
    return;
  }
};

const checkPreviousAppointmentOverlap = async ({
  date,
  time,
  barberId,
}: BookingBody) => {
  const timestamp = convertToTimestamp(date as string, time as string);
  try {
    const previousAppointment = await prisma.appointments.findFirst({
      where: {
        barberId: barberId,
        dateTime: { lt: new Date(timestamp) },
      },
      orderBy: {
        dateTime: "desc",
      },
      take: 1,
      include: {
        services: {
          include: { service: true },
        },
      },
    });
    if (previousAppointment) {
      const totalDurationMs = previousAppointment.services.reduce(
        (total, appointmentService) =>
          total + appointmentService.service.duration_mins * 60 * 1000,
        0
      );
      if (
        previousAppointment.dateTime.getTime() + totalDurationMs >
        timestamp
      ) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.log(error);
  }
};

const checkNextAppointmentOverlap = async ({
  date,
  time,
  barberId,
  services,
}: BookingBody) => {
  const timestamp = convertToTimestamp(date, time);
  try {
    const nextAppointment = await prisma.appointments.findFirst({
      where: {
        barberId: barberId,
        dateTime: {
          gt: new Date(timestamp),
        },
      },
      orderBy: { dateTime: "asc" },
      take: 1,
    });

    if (nextAppointment) {
      try {
        const durationsObjects = await prisma.services.findMany({
          where: {
            id: { in: services },
          },
          select: {
            duration_mins: true,
          },
        });

        const duration_mins = durationsObjects.map((obj) => obj.duration_mins);
        const duration_ms = duration_mins.reduce(
          (total, durationInMinutes) => total + durationInMinutes * 60 * 1000
        );
        if (timestamp + duration_ms > nextAppointment.dateTime.getTime()) {
          return true;
        }
      } catch (error) {
        console.log(error);
      }
    }
    return false;
  } catch (error) {
    console.log(error);
  }
};

const hasAppointmentAtTheSameTime = async ({
  date,
  time,
  barberId,
}: BookingBody) => {
  const timestamp = convertToTimestamp(date, time);
  try {
    const hasAppointment = await prisma.appointments.findFirst({
      where: {
        barberId: barberId,
        dateTime: new Date(timestamp),
      },
    });
    if (hasAppointment) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
  }
};

export async function checkBarberAvailabilityForBooking(
  req: AuthRequest<{}, {}, BookingBody>,
  res: Response,
  next: NextFunction
) {
  const { date, time } = req.body;
  const isBarberAvailable = await isBarberAvailableOnDate(req.body);
  const previousAppointmentHasOverlap = await checkPreviousAppointmentOverlap(
    req.body
  );
  const nextAppointmentHasOverlap = await checkNextAppointmentOverlap(req.body);
  const timeNotAvailable = await hasAppointmentAtTheSameTime(req.body);

  if (
    !isBarberAvailable ||
    previousAppointmentHasOverlap ||
    nextAppointmentHasOverlap ||
    timeNotAvailable
  ) {
    res.status(400).json({
      error: `Barber unavailable for ${date}, ${time}, check the agenda`,
    });
    return;
  }
  next();
}
