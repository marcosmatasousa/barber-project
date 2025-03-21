import express from "express";
import { Request, Response } from "express";
import prisma from "../lib/prisma";

const barbers = express();

barbers.get("/barbers", async (req: Request, res: Response) => {
  try {
    const barbers = await prisma.users.findMany({
      where: {
        OR: [{ role: "barber" }, { role: "admin" }],
      },
      select: {
        name: true,
        id: true,
      },
    });
    res.status(200).json(barbers);
    return;
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
    return;
  }
});

export default barbers;
