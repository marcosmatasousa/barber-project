import { checkSchema } from "express-validator";
import prisma from "../lib/prisma";

export const unbookingValidator = checkSchema({
  appointmentId: {
    in: ["params"],
    isNumeric: true,
    notEmpty: { errorMessage: "Appointment ID required" },
    custom: {
      options: async (appointmentId) => {
        const appointment = await prisma.appointments.findUnique({
          where: {
            id: parseInt(appointmentId),
          },
        });
        if (!appointment) {
          throw new Error("Appointment not found");
        }
      },
    },
  },
});
