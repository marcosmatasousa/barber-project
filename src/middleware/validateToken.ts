import { verify } from "../lib/jwt";
import { Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import { AuthRequest } from "../types/authRequest";

export function validateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.sendStatus(401);
    return;
  }

  try {
    const payload = verify(token) as JwtPayload;
    req.payload = payload;
    next();
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
    return;
  }
}
