import { checkSchema } from "express-validator";
import prisma from "../lib/prisma";
import { isValidDate } from "../utils/utils";
import { UserRole } from "@prisma/client";

export const rescheduleValidator = checkSchema({
  date: {
    in: ["body"],
    isString: {
      errorMessage: "Date must be a string",
    },
    optional: true,
    isISO8601: {
      options: { strict: true, strictSeparator: true },
      errorMessage: "Date must have YYYY-MM-DD format",
    },
  },
  time: {
    in: ["body"],
    isString: {
      errorMessage: "Time must be a string",
    },
    optional: true,
    matches: {
      options: /^([01]\d|2[0-3]):([0-5]\d)$/,
      errorMessage: "Time must have HH:MM format",
    },
  },
  barberId: {
    in: ["body"],
    isInt: {
      errorMessage: "Barber id must be of type int",
    },
    optional: true,
  },
  appointmentId: {
    in: ["params"],
    isInt: { errorMessage: "appointmentId must be of type int" },
    notEmpty: { errorMessage: "appointmentId must not be empty" },
    custom: {
      options: async (appointmentId, { req }) => {
        const appointment = await prisma.appointments.findUnique({
          where: { id: parseInt(appointmentId) },
        });

        if (!appointment) {
          throw new Error("Appointment not found");
        }
        const { date, time } = req.body;
        if (date || time) {
          let newDateTime = appointment.dateTime;
          if (date || time) {
            const originalDateTime = appointment.dateTime;
            newDateTime = new Date(
              `${date ? date : originalDateTime.toISOString().slice(0, 10)}T${
                time ? time : originalDateTime.toISOString().slice(11, 16)
              }:00.000Z`
            );
          }

          if (!isValidDate(newDateTime.toUTCString())) {
            throw new Error("Invalid date");
          }
        }

        const { barberId } = req.body;
        if (barberId) {
          const barberExists = await prisma.users.findUnique({
            where: { id: barberId },
          });

          if (!barberExists || barberExists.role === UserRole.client) {
            throw new Error("Barber not found");
          }
        }
        return true;
      },
    },
  },
});
