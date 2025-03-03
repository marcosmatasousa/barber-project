import prisma from "../lib/prisma";
import { AuthRequest } from "../types/authRequest";
import { BookingBody } from "../types/booking";
import { NextFunction, Response } from "express";

export async function validateBookingData(
  req: AuthRequest<{}, {}, BookingBody>,
  res: Response,
  next: NextFunction
) {
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
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
