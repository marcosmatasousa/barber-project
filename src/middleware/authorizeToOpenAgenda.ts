import { UserRole } from "@prisma/client";
import { AuthRequest } from "../types/authRequest";
import { Response, NextFunction } from "express";

export function authorizeToOpenAgenda(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (req.payload?.role === UserRole.client) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
