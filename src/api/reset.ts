import type { RequestHandler } from "express";
import { config } from "../config.js";

export const handlerReset: RequestHandler = (_req, res) => {
  config.api.fileServerHits = 0
  res.write("Hits reset to 0");
  res.end();
};
