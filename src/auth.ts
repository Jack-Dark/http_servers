import { hash, verify } from "argon2"
import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import type { Request } from "express";

import { BadRequestError, UserNotAuthenticatedError } from "./api/errors.js";
import { config } from "./config.js";


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
    iss: config.jwt.issuer,
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

  if (decoded.iss !== config.jwt.issuer) {
    throw new UserNotAuthenticatedError("Invalid issuer");
  }

  if (!decoded.sub) {
    throw new UserNotAuthenticatedError("No user ID in token");
  }

  return decoded.sub;
}

const malformedAuthHeaderMsg = "Malformed authorization header";

export const getBearerToken = (req: Request) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw new BadRequestError(malformedAuthHeaderMsg);
  }

  return extractBearerToken(authHeader);
}

export const extractBearerToken = (header: string) => {
  const splitAuth = header.split(" ");
  if (splitAuth.length < 2 || splitAuth[0] !== "Bearer") {
    throw new BadRequestError(malformedAuthHeaderMsg);
  }
  return splitAuth[1];
}