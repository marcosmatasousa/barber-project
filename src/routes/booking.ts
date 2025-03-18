import express, { NextFunction } from "express";
import { Response } from "express";
import { convertToTimestamp } from "../utils/utils";
import prisma from "../lib/prisma";
import { validateToken } from "../middleware/validateToken";
import { AuthRequest } from "../types/authRequest";
import {
  BookingBody,
  DeletePathParams,
  RescheduleBody,
} from "../types/booking";
import { validationResult } from "express-validator";
import { bookingValidator } from "../validators/bookingValidator";
import { unbookingValidator } from "../validators/unbookingValidator";
import { authorizeAppointmentModification } from "../middleware/authorizeAppointmentModification";
import { rescheduleValidator } from "../validators/rescheduleValidator";
import { checkBarberAvailabilityForBooking } from "../middleware/checkBarberAvailabilityForBooking";
import { checkBarberAvailabilityForReschedule } from "../middleware/checkBarberAvailabilityForReschedule";
import { checkAuthorizationForBooking } from "../middleware/checkAuthorizationForBooking";

const booking = express();

const validate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

booking.post(
  "/booking",
  validateToken,
  bookingValidator,
  validate,
  checkAuthorizationForBooking,
  checkBarberAvailabilityForBooking,
  async (req: AuthRequest<{}, {}, BookingBody>, res: Response) => {
    const { date, time, clientId, barberId, services } = req.body;
    const timestamp = convertToTimestamp(date, time);

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
  validateToken,
  unbookingValidator,
  validate,
  authorizeAppointmentModification,
  async (req: AuthRequest<DeletePathParams>, res: Response) => {
    const { appointmentId } = req.params;

    try {
      await prisma.appointmentsServices.deleteMany({
        where: {
          appointmentId: parseInt(appointmentId),
        },
      });

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
  rescheduleValidator,
  validate,
  authorizeAppointmentModification,
  checkBarberAvailabilityForReschedule,
  async (
    req: AuthRequest<DeletePathParams, {}, RescheduleBody>,
    res: Response
  ) => {
    const { appointmentId } = req.params;
    const { date, time, barberId } = req.body;

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
      const updatedAppointment = await prisma.appointments.update({
        where: {
          id: parseInt(appointmentId),
        },
        data: {
          dateTime: date || time ? newDateTime : appointment?.dateTime,
          barberId: barberId || appointment?.barberId,
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
