import { RequestHandler } from "express";
import { getUserById, updateUserIsChirpyRed } from "../db/queries/users.js";
import { BadRequestError, NotFoundError } from "./errors.js";

export const handlerCheckChirpyRed: RequestHandler = async (req, res) => {
  type Params = {
    event: "user.upgraded",
    data: {
      userId: string
    }
  }

  const params: Params = req.body;

  if (params.event !== 'user.upgraded') {
    res.status(204).send()
    return
  }

  const { userId } = params.data;

  if (!userId) {
    throw new BadRequestError('Missing required fields')
  }

  const user = await getUserById(userId)

  if (!user) {
    throw new NotFoundError(`User with userId: "${userId}" not found`)
  }

  if (user.isChirpyRed) {
    res.status(204).send()
    return
  }

  const updated = await updateUserIsChirpyRed({ isChirpyRed: true, id: userId });
  if (!updated) {
    throw new Error(`Failed to update Chirpy Red status for user with userId: ${userId}`);
  }

  res.status(204).send()
}