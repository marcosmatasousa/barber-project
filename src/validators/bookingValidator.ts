import { checkSchema, Schema } from "express-validator";

const numericFields = [
  "day",
  "year",
  "month",
  "hour",
  "minutes",
  "barberId",
  "clientId",
  "serviceId",
];

export const bookingValidador = checkSchema(
  numericFields.reduce((schema: Schema, field) => {
    schema[field] = {
      isNumeric: true,
      notEmpty: { errorMessage: `${field} required` },
    };
    return schema;
  }, {})
);