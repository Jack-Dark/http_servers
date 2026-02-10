import type { Request, Response } from "express";
import { config } from "../config.js";

export const handlerMetrics = (_req: Request, res: Response) => {
  res.contentType('text/html; charset=utf-8')
  res.send(`
<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.fileserverHits} times!</p>
  </body>
</html>`);
};
