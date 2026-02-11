import type { RequestHandler } from "express";
import { getUserByEmail } from "src/db/queries/users";
import { BadRequestError, UserNotAuthenticatedError } from "./errors";
import { respondWithJSON } from "./json";
import { checkPasswordHash } from "../auth";


export const handlerLogin: RequestHandler = async (req, res) => {
  type Params = {
    email: string;
    password: string;
  };
  const { email, password, }: Params = req.body;

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

  respondWithJSON(res, 200, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
};
