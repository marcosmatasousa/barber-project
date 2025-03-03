import express from "express";
import { Request, Response } from "express";
import { Auth } from "../types/auth";
import { User } from "../types/user";
import { verify } from "../lib/argon2";
import { sign } from "../lib/jwt";
import prisma from "../lib/prisma";
const auth = express();

async function validateCredentials(
  user: User,
  password: string
): Promise<boolean> {
  return await verify(user.password, password);
}

auth.post("/auth", async (req: Request<{}, {}, Auth>, res: Response) => {
  const { username, password } = req.body;

  const user = await prisma.users.findFirst({
    where: {
      username: username,
    },
  });

  if (!user || !(await validateCredentials(user, password))) {
    res.status(401).json({ error: "Bad credentials" });
    return;
  }

  const accessToken = sign({
    username: user.username,
    id: user.id,
    role: user.role,
  });
  
  res.status(200).json({ accessToken: accessToken });
});

export default auth;
