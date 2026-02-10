import { config } from "../config.js";
import type { Request, Response, NextFunction } from "express";

export type Middleware = (req: Request, res: Response, next: NextFunction) => void;

export const middlewareLogResponse: Middleware = (req, res, next) => {
  res.on('finish', () => {
    const statusCode = res.statusCode;

    if (statusCode >= 300) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
    }
  });
  next();
};

export const middlewareMetricsInc: Middleware = (_req, _res, next) => {
  config.fileserverHits++
  next();
};
