import express from "express";
import { Request, Response } from "express";
import prisma from "../lib/prisma";

const services = express();

services.get("/services", async (req: Request, res: Response) => {
  try {
    const services = await prisma.services.findMany({
      select: {
        name: true,
        id: true,
      },
    });
    res.status(200).json(services);
    return;
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

export default services;
