import prisma from "../lib/prisma";
import { AuthRequest } from "../types/authRequest";
import { BookingBody } from "../types/booking";
import { NextFunction, Response } from "express";
import { isValidDate } from "../utils/utils";

export async function validateBookingData(
  req: AuthRequest<{}, {}, BookingBody>,
  res: Response,
  next: NextFunction
) {
  const { year, month, day } = req.body;
  if (!isValidDate(year, month, day)) {
    res.status(400).json({ error: "Invalid date" });
    return;
  }

  const { clientId, barberId, serviceId } = req.body;
  try {
    const clientExists = await prisma.users.findUnique({
      where: {
        id: clientId,
      },
    });
    if (!clientExists) {
      res.status(400).json({ error: "Client not found" });
      return;
    }

    const barberExists = await prisma.users.findUnique({
      where: {
        id: barberId,
      },
    });
    if (!barberExists || barberExists.role === "client") {
      res.status(400).json({ error: "Barber not found" });
      return;
    }

    const serviceExists = await prisma.services.findUnique({
      where: {
        id: serviceId,
      },
    });
    if (!serviceExists) {
      res.status(400).json({ error: "Service not found" });
      return;
    }

    if (clientId !== req.payload?.id && req.payload?.role !== "admin") {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
