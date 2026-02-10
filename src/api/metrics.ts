import type { Request, Response } from "express";
import { config } from "../config.js";

export const handlerMetrics = (_req: Request, res: Response) => {
  res.send(`Hits: ${config.fileserverHits}`);
};
