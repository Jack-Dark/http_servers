import type { RequestHandler } from "express";

import { getUserByEmail } from "../db/queries/users.js";
import { BadRequestError, UserNotAuthenticatedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { checkPasswordHash, getBearerToken, makeJWT, makeRefreshToken, validateJWT } from "../auth.js";
import { config } from "../config.js";
import { UserResponse } from "./users.js";
import { saveRefreshToken, getRefreshToken, revokeToken } from "../db/queries/refresh.js";


type LoginResponse = UserResponse & {
  token: string;
  refreshToken: string;
};
export const handlerLogin: RequestHandler = async (req, res) => {
  type Params = {
    email: string;
    password: string;
  };
  const params: Params = req.body
  const { email, password, } = params;


  if (!email || !password) {
    throw new BadRequestError("Missing required fields");
  }

  const user = await getUserByEmail(email);

  const invalidLoginMessage = `incorrect email or password`;

  if (!user) {
    throw new UserNotAuthenticatedError(invalidLoginMessage);
  }

  const { hashedPassword } = user;

  const isValidCredentials = await checkPasswordHash(password, hashedPassword);

  if (!isValidCredentials) {
    throw new UserNotAuthenticatedError(invalidLoginMessage);
  }

  const accessToken = makeJWT(user.id, config.jwt.defaultDuration, config.jwt.secret)
  const refreshToken = makeRefreshToken()

  const isSaved = await saveRefreshToken({
    userId: user.id,
    token: refreshToken,
  })

  if (!isSaved) {
    throw new UserNotAuthenticatedError("could not save refresh token");
  }

  respondWithJSON(res, 200, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    token: accessToken,
    refreshToken,
  } satisfies LoginResponse);
};

export const handlerRefreshToken: RequestHandler = async (req, res) => {
  const refreshToken = getBearerToken(req);
  const userId = await validateRefreshToken(refreshToken)

  const accessToken = makeJWT(userId, config.jwt.defaultDuration, config.jwt.secret)

  respondWithJSON(res, 200, {
    token: accessToken,
  } satisfies {
    token: string;
  });
}

/** If valid, returns the user ID associated with the token. */
export const validateRefreshToken = async (token: string) => {
  if (!token) {
    throw new UserNotAuthenticatedError("missing refresh token")
  }

  const matchingToken = await getRefreshToken(token);
  if (!matchingToken) {
    throw new UserNotAuthenticatedError("refresh token not found")
  }

  const now = Date.now()
  const isRevoked = !!matchingToken.revokedAt;
  const expiresAt = new Date(matchingToken.expiresAt).getTime();
  const isExpired = expiresAt < now;
  if (!matchingToken || isRevoked || isExpired) {
    throw new UserNotAuthenticatedError("invalid refresh token")
  }

  return matchingToken.userId
}

export const handlerRevokeToken: RequestHandler = async (req, res) => {
  const bearerToken = getBearerToken(req);
  await validateRefreshToken(bearerToken)

  await revokeToken(bearerToken)

  respondWithJSON(res, 204, undefined);
}
