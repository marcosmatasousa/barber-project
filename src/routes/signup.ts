import express, { NextFunction } from "express";
import { Request, Response } from "express";
import { hash } from "../lib/argon2";
import { SignUp } from "../types/signup";
import { validationResult } from "express-validator";
import { SignUpValidator } from "../validators/signUpValidator";
import prisma from "../lib/prisma";

const signup = express();

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

signup.post(
  "/signup",
  SignUpValidator,
  validate,
  async (req: Request<{}, {}, SignUp>, res: Response) => {
    const { name, username, password } = req.body;

    const hashedPassword = await hash(password);
    if (!hashedPassword) {
      res.sendStatus(500);
      return;
    }

    try {
      const newUser = await prisma.users.create({
        data: {
          username: username,
          name: name,
          password: hashedPassword,
        },
      });
      res.status(201).json({ name: name, username: username, id: newUser.id });
      return;
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  }
);

export default signup;
