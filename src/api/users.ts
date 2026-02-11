import type { RequestHandler } from "express";

import { createUser } from "../db/queries/users.js";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { hashPassword } from "../auth.js";
import { NewUser } from "../db/schema.js";


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


