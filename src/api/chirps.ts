import type { RequestHandler } from "express";

import { respondWithJSON } from "./json.js";
type CreateChirpParams = {
  body: string;
  userId: string;
};

export const maxChirpLength = 140;

export const handlerCreateChirp: RequestHandler = async (req, res, next) => {
  const params: CreateChirpParams = req.body;

  if (params.body.length > maxChirpLength) {
    res.status(400).json({
      error: `Chirp is too long. Max length is ${maxChirpLength}`
    });
  }

  const badWords = [
    /kerfuffle/ig,
    /sharbert/ig,
    /fornax/ig,
  ];
  const hasBadWord = badWords.some(word => {
    return word.test(params.body)
  })

  if (hasBadWord) {
    badWords.forEach(word => {
      params.body = params.body.replace(word, '****')
    })
  }



  respondWithJSON(res, 201, {
    body: params.body,
    userId: params.userId
  });
}

