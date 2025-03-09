import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/authRequest";
import { DeletePathParams } from "../types/booking";
import prisma from "../lib/prisma";
import { UserRole } from "@prisma/client";

export async function authorizeAppointmentModification(
  req: AuthRequest<DeletePathParams>,
  res: Response,
  next: NextFunction
) {
  const { appointmentId } = req.params;
  try {
    const appointment = await prisma.appointments.findUnique({
      where: { id: parseInt(appointmentId) },
    });
    if (
      req.payload?.id !== appointment?.clientId &&
      req.payload?.role !== UserRole.admin
    ) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
