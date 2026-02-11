import type { RequestHandler } from "express";

import { respondWithJSON } from "./json.js";
import { BadRequestError, NotFoundError } from "./errors.js";
import { createChirp, getChirp, getChirps } from "../db/queries/chirps.js";

export const maxChirpLength = 140;

export const handlerChirpsCreate: RequestHandler = async (req, res, next) => {
  type Params = {
    body: string;
    userId: string;
  };
  const params: Params = req.body;



  const cleaned = validateChirp(params.body);
  const chirp = await createChirp({ body: cleaned, userId: params.userId });

  respondWithJSON(res, 201, chirp);
}

function validateChirp(body: string) {
  const maxChirpLength = 140;
  if (body.length > maxChirpLength) {
    throw new BadRequestError(
      `Chirp is too long. Max length is ${maxChirpLength}`,
    );
  }

  const badWords = ["kerfuffle", "sharbert", "fornax"];
  return getCleanedBody(body, badWords);
}

function getCleanedBody(body: string, badWords: string[]) {
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


export const handlerGetChirp: RequestHandler<{ id: string }> = async (req, res) => {
  const params = req.params;
  const chirp = await getChirp(params.id);

  if (!chirp) {
    throw new NotFoundError('Chirp not found.')
  }

  respondWithJSON(res, 200, chirp);
}