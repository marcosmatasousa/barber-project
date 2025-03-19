import { checkSchema } from "express-validator";
import prisma from "../lib/prisma";

export const SignUpValidator = checkSchema({
  username: {
    isString: true,
    notEmpty: { errorMessage: "Username required" },
    isLength: {
      options: { min: 5, max: 20 },
      errorMessage: "Username must be between 5 and 20 characters",
    },
    custom: {
      options: async (username) => {
        const usernameAlreadyExists = await prisma.users.findFirst({
          where: {
            username: username,
          },
        });
        if (usernameAlreadyExists) {
          throw new Error("username already exists");
        }
        return true;
      },
    },
  },
  name: {
    isString: true,
    notEmpty: { errorMessage: "Name required" },
    isLength: {
      options: { min: 3, max: 40 },
      errorMessage: "Name must be between 3 and 40 characters",
    },
  },
  password: {
    isString: true,
    isLength: {
      options: { min: 8 },
      errorMessage: "Password must have a least 8 characters",
    },
  },
});
