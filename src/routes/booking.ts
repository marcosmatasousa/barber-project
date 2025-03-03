import express, { NextFunction } from "express";
import { Request, Response } from "express";
import { convertToTimestamp } from "../utils/utils";
import prisma from "../lib/prisma";
import { validateToken } from "../middleware/validateToken";
import { AuthRequest } from "../types/authRequest";
import { BookingBody } from "../types/booking";
import { validateBookingData } from "../middleware/validateBookingData";
import { validationResult } from "express-validator";
import { bookingValidador } from "../validators/bookingValidator";

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
  bookingValidador,
  validate,
  validateToken,
  validateBookingData,
  async (req: AuthRequest<{}, {}, BookingBody>, res: Response) => {
    const timestamp = convertToTimestamp(req.body);
    const { clientId, barberId, serviceId } = req.body;

    if (clientId !== req.payload?.id && req.payload?.role !== "admin") {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const appointment = await prisma.appointments.create({
        data: {
          dateTime: new Date(timestamp),
          clientId: clientId,
          barberId: barberId,
          serviceId: serviceId,
        },
      });
      res.status(201).json(appointment);
      return;
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }
  }
);

booking.delete(
  "/appointment/delete/:id",
  validateToken,
  (req: Request, res: Response) => {}
);

export default booking;
