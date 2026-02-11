import type { RequestHandler } from "express";

import { getUserByEmail } from "../db/queries/users.js";
import { BadRequestError, UserNotAuthenticatedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { checkPasswordHash, makeJWT } from "../auth.js";
import { config } from "../config.js";
import { UserResponse } from "./users.js";


type LoginResponse = UserResponse & {
  token: string;
};
export const handlerLogin: RequestHandler = async (req, res) => {
  type Params = {
    email: string;
    password: string;
    expiresInSec?: number
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

  let duration = params.expiresInSec
  if (!duration || duration > config.jwt.defaultDuration) {
    duration = config.jwt.defaultDuration
  }
  const token = makeJWT(user.id, duration, config.jwt.secret)

  respondWithJSON(res, 200, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    token,
  } satisfies LoginResponse);
};