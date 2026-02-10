import type { Request, Response } from "express";

import { respondWithJSON, respondWithError } from "./json.js";

export async function handlerChirpsValidate(req: Request, res: Response) {
  type parameters = {
    body: string;
  };

  const params: parameters = req.body;

  const maxChirpLength = 140;
  if (params.body.length > maxChirpLength) {
    respondWithError(res, 400, "Chirp is too long");
    return;
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