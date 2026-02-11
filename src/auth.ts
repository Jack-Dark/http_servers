import { hash, verify } from "argon2"
import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import type { Request } from "express";

import { UserNotAuthenticatedError } from "./api/errors.js";

const TOKEN_ISSUER = "chirpy";

export const hashPassword = (password: string) => {
  return hash(password);
}

export const checkPasswordHash = async (password: string, hash: string) => {
  if (!password) return false;
  try {
    return await verify(hash, password);
  } catch {
    return false;
  }
}

type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export const makeJWT = (userID: string, expiresIn: number, secret: string): string => {
  const iat = Math.floor(Date.now() / 1000);
  const payload: Payload = {
    iss: 'chirpy',
    sub: userID,
    iat,
    exp: iat + expiresIn
  }
  return jwt.sign(payload, secret);
}

/** Returns user ID associated with token. */
export const validateJWT = (tokenString: string, secret: string): string => {
  let decoded: Payload;
  try {
    decoded = jwt.verify(tokenString, secret) as JwtPayload;
  } catch (e) {
    throw new UserNotAuthenticatedError("Invalid token");
  }

  if (decoded.iss !== TOKEN_ISSUER) {
    throw new UserNotAuthenticatedError("Invalid issuer");
  }

  if (!decoded.sub) {
    throw new UserNotAuthenticatedError("No user ID in token");
  }

  return decoded.sub;
}

export const getBearerToken = (req: Request) => {
  let token = req.get('Authorization');
  token = token?.replace(/bearer\s/i, '')
  return token
}
