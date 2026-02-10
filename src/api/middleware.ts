import { config } from "../config.js";
import type { RequestHandler, ErrorRequestHandler } from "express";
import { respondWithError } from "./json.js";

export const middlewareLogResponse: RequestHandler = (req, res, next) => {
  res.on('finish', () => {
    const statusCode = res.statusCode;

    if (statusCode >= 300) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
    }
  });
  next();
};

export const middlewareMetricsInc: RequestHandler = (_req, _res, next) => {
  config.api.fileServerHits++
  next();
};


export const errorHandlerMiddleware: ErrorRequestHandler = (
  err: Error,
  _req,
  res,
  _next,
) => {

  let message = "Something went wrong on our end";

  console.log(err.message);

  respondWithError(res, res.statusCode, message);
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}