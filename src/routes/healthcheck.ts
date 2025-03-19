import express from "express";
import { Response } from "express";
import { validateToken } from "../middleware/validateToken";
import { AuthRequest } from "../types/authRequest";

const healthcheck = express();

healthcheck.get("/me", validateToken, (req: AuthRequest, res: Response) => {
  const payload = req.payload;

  if (typeof payload === "object")
    res
      .status(200)
      .send(`Everything's OK. You are an ${payload.role} of this system`);
  return;
});

export default healthcheck;
