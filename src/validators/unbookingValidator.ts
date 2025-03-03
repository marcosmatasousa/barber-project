import { checkSchema } from "express-validator";

export const unbookingValidator = checkSchema({
  appointmentId: {
    isNumeric: true,
    notEmpty: { errorMessage: "Appointment ID required" },
  },
});
