import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/authRequest";
import { BookingBody } from "../types/booking";
import { UserRole } from "@prisma/client";

const isAuthorizated = (req: AuthRequest<{}, {}, BookingBody>) => {
  const { clientId } = req.body;

  return req.payload?.id !== clientId && req.payload?.role === UserRole.client
    ? false
    : true;
};

export async function checkAuthorizationForBooking(
  req: AuthRequest<{}, {}, BookingBody>,
  res: Response,
  next: NextFunction
) {
  if (!isAuthorizated(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
