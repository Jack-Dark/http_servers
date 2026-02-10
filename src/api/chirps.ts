import type { RequestHandler } from "express";

import { respondWithJSON } from "./json.js";
type Params = {
  body: string;
};

export const handlerChirpsValidate: RequestHandler = async (req, res) => {

  const params: Params = req.body;

  const maxChirpLength = 140;
  if (params.body.length > maxChirpLength) {
    throw new Error("Chirp is too long");
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

  respondWithJSON(res, 200, {
    cleanedBody: params.body,
  });
}