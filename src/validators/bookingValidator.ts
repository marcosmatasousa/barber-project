import { checkSchema, Schema } from "express-validator";

const numericFields = [
  "day",
  "year",
  "month",
  "hour",
  "minutes",
  "barberId",
  "clientId",
];

const schema = numericFields.reduce((schema: Schema, field) => {
  schema[field] = {
    isNumeric: true,
    notEmpty: { errorMessage: `${field} required` },
  };
  return schema;
}, {});

export const bookingValidator = checkSchema({
  ...schema,
  services: {
    isArray: { options: { min: 1, max: 3 } },
    notEmpty: { errorMessage: "Service ID required" },
  },
});
