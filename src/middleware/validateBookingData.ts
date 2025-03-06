import prisma from "../lib/prisma";
import { AuthRequest } from "../types/authRequest";
import { BookingBody } from "../types/booking";
import { NextFunction, Response } from "express";
import { convertToTimestamp, isValidDate } from "../utils/utils";

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

  const { clientId, barberId, services } = req.body;

  try {
    const timestamp = convertToTimestamp(req.body);
    const isDateUnavailable = await prisma.appointments.findFirst({
      where: {
        dateTime: new Date(timestamp),
      },
    });

    if (isDateUnavailable) {
      res.status(400).json({ error: "Date unavailable" });
      return;
    }

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

    for (const service of services) {
      const serviceExists = await prisma.services.findUnique({
        where: {
          id: parseInt(service),
        },
      });
      if (!serviceExists) {
        res.status(400).json({ error: `Service ${service} does not exist` });
        return;
      }
    }

    const checkSet = new Set(services);
    if (checkSet.size !== services.length) {
      res.status(400).json({ error: "Repeated service" });
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
