import prisma from "../lib/prisma";
import { AuthRequest } from "../types/authRequest";
import { NextFunction, Response } from "express";
import { DeletePathParams } from "../types/booking";

export async function validateUnbookingData(
  req: AuthRequest<DeletePathParams>,
  res: Response,
  next: NextFunction
) {
  const { appointmentId } = req.params;

  try {
    const appointment = await prisma.appointments.findUnique({
      where: {
        id: parseInt(appointmentId),
      },
    });

    if (!appointment) {
      res.status(400).json({ error: "Bad request, invalid appointment ID" });
      return;
    }

    if (
      req.payload?.id !== appointment?.clientId &&
      req.payload?.role !== "admin"
    ) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    next();
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
    return;
  }
}
