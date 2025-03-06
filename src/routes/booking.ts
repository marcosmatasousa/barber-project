import express, { NextFunction } from "express";
import { Response } from "express";
import { convertToTimestamp, isValidDate } from "../utils/utils";
import prisma from "../lib/prisma";
import { validateToken } from "../middleware/validateToken";
import { AuthRequest } from "../types/authRequest";
import {
  BookingBody,
  DeletePathParams,
  RescheduleBody,
} from "../types/booking";
import { validateBookingData } from "../middleware/validateBookingData";
import { validateUnbookingData } from "../middleware/validateUnbookingData";
import { validationResult } from "express-validator";
import { bookingValidator } from "../validators/bookingValidator";
import { unbookingValidator } from "../validators/unbookingValidator";

const booking = express();

const validate = (
  req: AuthRequest<{}, {}, BookingBody>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

booking.post(
  "/booking",
  bookingValidator,
  validate,
  validateToken,
  validateBookingData,
  async (req: AuthRequest<{}, {}, BookingBody>, res: Response) => {
    const timestamp = convertToTimestamp(req.body);
    const { clientId, barberId, services } = req.body;

    try {
      const appointment = await prisma.appointments.create({
        data: {
          dateTime: new Date(timestamp),
          clientId: clientId,
          barberId: barberId,
          services: {
            create: services.map((serviceId: number) => ({
              serviceId: serviceId,
            })),
          },
        },
      });

      res.status(201).json({ ...appointment, services: services });
      return;
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }
  }
);

booking.delete(
  "/booking/:appointmentId",
  unbookingValidator,
  validate,
  validateToken,
  validateUnbookingData,
  async (req: AuthRequest<DeletePathParams>, res: Response) => {
    const { appointmentId } = req.params;

    try {
      await prisma.appointments.delete({
        where: {
          id: parseInt(appointmentId),
        },
      });

      res.sendStatus(204);
      return;
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }
  }
);

booking.patch(
  "/booking/:appointmentId/reschedule",
  validateToken,
  async (
    req: AuthRequest<DeletePathParams, {}, RescheduleBody>,
    res: Response
  ) => {
    const { appointmentId } = req.params;
    const { year, day, month, hour, minutes, barberId } = req.body;

    try {
      const appointment = await prisma.appointments.findUnique({
        where: { id: parseInt(appointmentId) },
      });

      if (!appointment) {
        res.status(404).json({ error: "Appointment not found" });
        return;
      }

      if (
        req.payload?.id !== appointment.clientId &&
        req.payload?.role !== "admin"
      ) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      let newDateTime = appointment.dateTime;
      if (year || day || month || hour || minutes) {
        const originalDateTime = appointment.dateTime;
        newDateTime = new Date(
          year ? year : originalDateTime.getFullYear(),
          day ? day : originalDateTime.getDate(),
          month ? month : originalDateTime.getMonth(),
          hour ? hour : originalDateTime.getHours(),
          minutes ? minutes : originalDateTime.getMinutes(),
          0,
          0
        );
      }

      if (
        !isValidDate(
          newDateTime.getFullYear(),
          newDateTime.getMonth(),
          newDateTime.getDate()
        )
      ) {
        res.status(400).json({ error: "Invalid date" });
        return;
      }

      if (barberId) {
        const barberExists = await prisma.users.findUnique({
          where: {
            id: barberId,
          },
        });
        if (!barberExists || barberExists.role === "client") {
          res.status(400).json({ error: "Barber not found" });
          return;
        }
      }

      const updatedAppointment = await prisma.appointments.update({
        where: {
          id: parseInt(appointmentId),
        },
        data: {
          dateTime:
            day && month && hour && minutes
              ? newDateTime
              : appointment.dateTime,
          barberId: barberId || appointment.barberId,
        },
      });

      res.status(200).json(updatedAppointment);
      return;
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
  }
);

export default booking;
