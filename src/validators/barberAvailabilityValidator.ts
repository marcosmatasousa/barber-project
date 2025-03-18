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

          const newStartTime = new Date(
            `${date.date}T${date.startTime}:00.000Z`
          );
          const newEndTime = new Date(`${date.date}T${date.endTime}:00.000Z`);

          const overlappingDateExists =
            await prisma.barberAvailability.findFirst({
              where: {
                barberId: req.payload?.id,
                OR: [
                  {
                    startTime: { lt: newStartTime },
                    endTime: { gt: newStartTime },
                  },
                  {
                    startTime: { lt: newEndTime },
                    endTime: { gt: newEndTime },
                  },
                  {
                    startTime: { gte: newStartTime },
                    endTime: { lte: newEndTime },
                  },
                ],
              },
            });

          if (overlappingDateExists) {
            throw new Error(
              `${date.date}, ${date.startTime} - ${date.endTime} is an overlapping date.`
            );
          }
        }

        const datesCount: { [date: string]: number } = {};
        for (const obj of availabilityDates) {
          if (datesCount[obj.date]) {
            datesCount[obj.date] += 1;
            if (datesCount[obj.date] > 1) {
              throw new Error(`Repeated date: ${obj.date}`);
            }
          } else {
            datesCount[obj.date] = 1;
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
