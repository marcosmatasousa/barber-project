import express, { NextFunction } from "express";
import { Request, Response } from "express";
import {
  availabilityDate,
  availabilityRequestBody,
} from "../types/availabilityRequest";
import { AuthRequest } from "../types/authRequest";
import { validationResult } from "express-validator";
import { validateToken } from "../middleware/validateToken";
import prisma from "../lib/prisma";
import { barberAvailabilityValidator } from "../validators/barberAvailabilityValidator";
import { authorizeToOpenAgenda } from "../middleware/authorizeToOpenAgenda";

const agenda = express();

const validate = (
  req: AuthRequest<{}, {}, availabilityRequestBody>,
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

agenda.post(
  "/agenda",
  validateToken,
  authorizeToOpenAgenda,
  barberAvailabilityValidator,
  validate,
  async (req: AuthRequest<{}, {}, availabilityRequestBody>, res: Response) => {
    const { availabilityDates } = req.body;

    try {
      const formattedDates = availabilityDates.map(
        (dateObj: availabilityDate) => ({
          barberId: req.payload?.id,
          startTime: new Date(`${dateObj.date}T${dateObj.startTime}:00.000Z`),
          endTime: new Date(`${dateObj.date}T${dateObj.endTime}:00.000Z`),
        })
      );
      console.log(formattedDates);

      const createdAvailability = await prisma.barberAvailability.createMany({
        data: formattedDates,
      });

      res.status(201).json({ availability: createdAvailability });
      return;
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

agenda.get(
  "/agenda/:barberId",
  async (req: AuthRequest<{ barberId: string }>, res: Response) => {
    const { barberId } = req.params;

    const availability = await prisma.barberAvailability.findMany({
      where: {
        barberId: parseInt(barberId),
      },
      orderBy: { startTime: "asc" },
    });

    const appointments = await prisma.appointments.findMany({
      where: {
        barberId: parseInt(barberId),
      },
      include: {
        services: {
          include: { service: true },
        },
      },
      orderBy: { dateTime: "asc" },
    });

    const availabilityByDate: {
      [date: string]: {
        availability: string[];
        booked: string[];
      };
    } = {};

    availability.forEach((item) => {
      const date = item.startTime.toISOString().split("T")[0];
      if (!availabilityByDate[date]) {
        availabilityByDate[date] = { availability: [], booked: [] };
      }
      const startTime = item.startTime
        .toISOString()
        .split("T")[1]
        .substring(0, 5);
      const endTime = item.endTime.toISOString().split("T")[1].substring(0, 5);

      availabilityByDate[date].availability.push(`${startTime} - ${endTime}`);
    });

    appointments.forEach((item) => {
      const date = item.dateTime.toISOString().split("T")[0];
      const startTime = item.dateTime
        .toISOString()
        .split("T")[1]
        .substring(0, 5);

      const durationInMs = item.services.reduce(
        (total, appointmentServices) =>
          total + appointmentServices.service.duration_mins * 60 * 1000,
        0
      );

      const endTime = new Date(item.dateTime.getTime() + durationInMs)
        .toISOString()
        .split("T")[1]
        .substring(0, 5);
      availabilityByDate[date].booked.push(`${startTime} - ${endTime}`);
    });
    res.status(200).json(availabilityByDate);
  }
);

export default agenda;
