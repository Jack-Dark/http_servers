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
  config.fileserverHits++
  next();
};


export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req,
  res,
  _next,
) => {
  let statusCode = 500;
  let message = "Something went wrong on our end";

  console.log(err.message);

  respondWithError(res, statusCode, message);
}
