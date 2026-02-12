import type { RequestHandler } from "express";

import { respondWithJSON } from "./json.js";
import { BadRequestError, NotFoundError, UserForbiddenError } from "./errors.js";
import { createChirp, deleteChirp, getChirp, getChirps } from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";
import { ChirpItem } from "../db/schema.js";
import { SortOption, sortOptions } from "../db/filters.js";


export const handlerChirpsCreate: RequestHandler<{}, ChirpItem, {
  body: string;
}, any> = async (req, res) => {
  const params = req.body;

  const bearerToken = getBearerToken(req);
  const userId = validateJWT(bearerToken, config.jwt.secret);

  const cleaned = validateChirp(params.body);
  const chirp = await createChirp({ body: cleaned, userId });

  respondWithJSON(res, 201, chirp);
}

const validateChirp = (body: string) => {
  const maxChirpLength = 140;
  if (body.length > maxChirpLength) {
    throw new BadRequestError(
      `Chirp is too long. Max length is ${maxChirpLength}`,
    );
  }

  const badWords = ["kerfuffle", "sharbert", "fornax"];
  return getCleanedBody(body, badWords);
}

const getCleanedBody = (body: string, badWords: string[]) => {
  const words = body.split(" ");

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const loweredWord = word.toLowerCase();
    if (badWords.includes(loweredWord)) {
      words[i] = "****";
    }
  }

  const cleaned = words.join(" ");
  return cleaned;
}

export const handlerGetAllChirps: RequestHandler<{}, ChirpItem[], any, { authorId?: string, sort?: SortOption }> = async (req, res) => {
  let authorId = "";
  let authorIdQuery = req.query.authorId;
  if (typeof authorIdQuery === "string") {
    authorId = authorIdQuery;
  }

  let sort: SortOption = sortOptions.asc;
  if (req.query.sort && Object.values(sortOptions).includes(req.query.sort)) {
    sort = req.query.sort
  }

  const chirps = await getChirps({ authorId, sort });

  respondWithJSON(res, 200, chirps);
}


export const handlerGetChirp: RequestHandler<{ chirpId: string }, ChirpItem, any, any> = async (req, res) => {
  const { chirpId } = req.params;

  const chirp = await getChirp(chirpId);

  if (!chirp) {
    throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`)
  }

  respondWithJSON(res, 200, chirp);
}

export const handlerChirpsDelete: RequestHandler<{ chirpId: string }, { "Authorization": string }, any, any> = async (req, res) => {
  const { chirpId } = req.params;

  const bearerToken = getBearerToken(req);
  const userId = validateJWT(bearerToken, config.jwt.secret);

  const chirp = await getChirp(chirpId);

  if (!chirp) {
    throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`)
  }

  if (chirp.userId !== userId) {
    throw new UserForbiddenError("You can't delete this chirp")
  }

  const deleted = await deleteChirp({ chirpId, userId });

  if (!deleted) {
    throw new Error(`Failed to delete chirp with chirpId: ${chirpId}`);
  }

  res.status(204).send()
}
