import { checkSchema } from "express-validator";
import prisma from "../lib/prisma";

export const barberAvailabilityValidator = checkSchema({
  availabilityDates: {
    isArray: {
      errorMessage: "availabilityDates must be an array",
    },
    notEmpty: {
      errorMessage: "availabilityDates must not be empty",
    },
    custom: {
      options: async (availabilityDates, { req }) => {
        for (const date of availabilityDates) {
          if (
            typeof date !== "object" ||
            !date.date ||
            !date.startTime ||
            !date.endTime
          ) {
            throw new Error(
              "Each item from availabilityDates must be an object with date, startTime and endTime attributes"
            );
          }

          const result = await prisma.barberAvailability.findFirst({
            where: {
              barberId: req.payload?.id,
              date: new Date(date.date),
            },
          });

          if (result) {
            throw new Error(
              `You have already set availability for ${date.date}. To alter startTime or endTime, access the appropriate path`
            );
          }
        }

        return true;
      },
    },
  },
  "availabilityDates.*.date": {
    isISO8601: {
      errorMessage: "date must have the format YYYY-MM-DD",
      options: { strict: true, strictSeparator: true },
    },
  },
  "availabilityDates.*.startTime": {
    matches: {
      options: /^([01]\d|2[0-3]):([0-5]\d)$/,
      errorMessage: "startTime must have the format HH:MM",
    },
    notEmpty: { errorMessage: "startTime must not be empty" },
  },
  "availabilityDates.*.endTime": {
    matches: {
      options: /^([01]\d|2[0-3]):([0-5]\d)$/,
      errorMessage: "endTime must have the format HH:MM",
    },
    notEmpty: { errorMessage: "endTime must not be empty" },
  },
});
