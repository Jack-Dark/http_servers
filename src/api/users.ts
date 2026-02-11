import type { RequestHandler } from "express";

import { createUser, loginUser } from "../db/queries/users.js";
import { BadRequestError, NotFoundError, UserNotAuthenticatedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { hashPassword } from "../db/auth.js";


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
  });
}

export const handlerUsersLogin: RequestHandler = async (req, res) => {
  type Params = {
    email: string;
    password: string;
  };
  const { email, password, }: Params = req.body;

  if (!email || !password) {
    throw new BadRequestError("Missing required fields");
  }

  const user = await loginUser({ email, password });

  if (!user) {
    throw new UserNotAuthenticatedError(`incorrect email or password`)
  }

  respondWithJSON(res, 200, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}
