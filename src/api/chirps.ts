import type { RequestHandler } from "express";

import { respondWithJSON } from "./json.js";
import { BadRequestError } from "./errors.js";
import { createChirp } from "../db/queries/chirps.js";
type CreateChirpParams = {
  body: string;
  userId: string;
};

export const maxChirpLength = 140;

export const handlerChirpsCreate: RequestHandler = async (req, res, next) => {
  const params: CreateChirpParams = req.body;



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