import { checkSchema, Schema } from "express-validator";
import prisma from "../lib/prisma";
import { UserRole } from "@prisma/client";
import { isValidDate } from "../utils/utils";

export const bookingValidator = checkSchema({
  date: {
    notEmpty: { errorMessage: "Date must not be empty" },
    isString: { errorMessage: "Date must be of type string" },
    isISO8601: {
      options: {
        strict: true,
        strictSeparator: true,
      },
      errorMessage: "Date must have YYYY-MM-DD format",
    },
    custom: {
      options: async (date, { req }) => {
        const { time } = req.body;
        const dateString = `${date}T${time}:00.000Z`;
        if (!isValidDate(dateString)) {
          throw new Error(
            "Invalid date, unable to schedule an appointment on past dates "
          );
        }
        return true;
      },
    },
  },
  time: {
    notEmpty: { errorMessage: "Time must not be empty" },
    isString: { errorMessage: "Time must be of type string" },
    matches: {
      options: /^([01]\d|2[0-3]):([0-5]\d)$/,
      errorMessage: "Time must have HH:MM format",
    },
  },
  barberId: {
    isNumeric: true,
    notEmpty: { errorMessage: "barberId required" },
    custom: {
      options: async (barberId) => {
        const barberExists = await prisma.users.findUnique({
          where: { id: barberId },
        });
        if (!barberExists || barberExists.role === UserRole.client) {
          throw new Error("Barber not found");
        }
        return true;
      },
    },
  },
  clientId: {
    isNumeric: true,
    notEmpty: { errorMessage: "clientId required" },
    custom: {
      options: async (clientId) => {
        const clientExists = await prisma.users.findUnique({
          where: {
            id: clientId,
          },
        });
        if (!clientExists) {
          throw new Error(`Client not found`);
        }
        return true;
      },
    },
  },
  services: {
    isArray: { options: { min: 1, max: 3 } },
    notEmpty: { errorMessage: "Service ID required" },
    custom: {
      options: async (services) => {
        const checkSet = new Set(services);
        if (checkSet.size !== services.length) {
          throw new Error("Repeated service");
        }
        for (const service of services) {
          const serviceExists = await prisma.services.findUnique({
            where: { id: parseInt(service) },
          });
          if (!serviceExists) {
            throw new Error(`Service ${service} does not exist`);
          }
        }
        return true;
      },
    },
  },
});
