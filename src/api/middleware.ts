import type { Request, Response, NextFunction } from "express";

export const middlewareLogResponses: Middleware = (req, res, next) => {
  res.on('finish', () => {
    const statusCode = res.statusCode;

    if (statusCode >= 300) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
    }
  });
  next();
};
type Middleware = (req: Request, res: Response, next: NextFunction) => void;
