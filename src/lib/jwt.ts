import jwt from "jsonwebtoken";

const JWT_SECRET = "meusegredo";

export function verify(token: string): jwt.JwtPayload | string | boolean {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return false;
  }
}

export function sign(payload: object): string {
  return jwt.sign(payload, JWT_SECRET);
}
