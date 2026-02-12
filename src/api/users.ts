import type { RequestHandler } from "express";

import { createUser, updateUser } from "../db/queries/users.js";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { getBearerToken, hashPassword, validateJWT } from "../auth.js";
import { NewUser } from "../db/schema.js";
import { config } from "../config.js";


export type UserResponse = Omit<NewUser, "hashedPassword">;
export const handlerUsersCreate: RequestHandler = async (req, res) => {
  type Params = {
    email: string;
    password: string;
  };
  const { email, password }: Params = req.body;

  if (!email || !password) {
    throw new BadRequestError("Missing required fields");
  }

  const hashedPassword = await hashPassword(password);

  const user = await createUser({ email, hashedPassword, });

  if (!user) {
    throw new Error("Could not create user");
  }

  respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } satisfies UserResponse);
}


export const handlerUsersUpdate: RequestHandler = async (req, res) => {
  type Params = {
    email: string;
    password: string;
  };
  const { email, password }: Params = req.body;


  const bearerToken = getBearerToken(req);
  const userId = validateJWT(bearerToken, config.jwt.secret);

  if (!email || !password) {
    throw new BadRequestError("Missing required fields");
  }

  const hashedPassword = await hashPassword(password);

  const updatedUser = await updateUser({ email, hashedPassword, id: userId });

  if (!updatedUser) {
    throw new Error("Could not update user");
  }

  respondWithJSON(res, 200, {
    id: updatedUser.id,
    email: updatedUser.email,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  } satisfies UserResponse);
}


