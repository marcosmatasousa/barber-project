import express, { NextFunction } from "express";
import { Response } from "express";
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

      const createdAvailability =
        await prisma.barberAvailability.createMany({
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

export default agenda;
