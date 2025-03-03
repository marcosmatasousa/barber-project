import { NextFunction, Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../types/authRequest";
import { DeletePathParams, RescheduleBody } from "../types/booking";
import { isValidDate } from "../utils/utils";


