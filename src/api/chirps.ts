import type { RequestHandler } from "express";

import { respondWithJSON } from "./json.js";
import { BadRequestError, NotFoundError, UserForbiddenError } from "./errors.js";
import { createChirp, deleteChirp, getChirp, getChirps } from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";

export const handlerChirpsCreate: RequestHandler = async (req, res) => {
  type Params = {
    body: string;
  };
  const params: Params = req.body;

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


export const handlerGetAllChirps: RequestHandler = async (req, res) => {
  const chirps = await getChirps();

  respondWithJSON(res, 200, chirps);
}


export const handlerGetChirp: RequestHandler<{ chirpId: string }> = async (req, res) => {
  const { chirpId } = req.params;
  const chirp = await getChirp(chirpId);

  if (!chirp) {
    throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`)
  }

  respondWithJSON(res, 200, chirp);
}

export const handlerChirpsDelete: RequestHandler<{ chirpId: string }> = async (req, res) => {
  const { chirpId } = req.params;

  const bearerToken = getBearerToken(req);
  const userId = validateJWT(bearerToken, config.jwt.secret);

  const chirp = await deleteChirp({ chirpId, userId });

  if (!chirp) {
    throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`)
  }

  if (chirp.userId !== userId) {
    throw new UserForbiddenError(`Chirp with chirpId: ${chirpId} not created by user with userId: ${userId}.`)
  }

  respondWithJSON(res, 204, {});
}
