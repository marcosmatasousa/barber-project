import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest<
  P = {},
  ResBody = any,
  ReqBody = any,
  ReqQuery = {},
  Locals extends Record<string, any> = Record<string, any>
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  payload?: JwtPayload;
}