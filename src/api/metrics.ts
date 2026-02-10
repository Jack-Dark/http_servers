import type { RequestHandler } from "express";
import { config } from "../config.js";

export const handlerMetrics: RequestHandler = (_req, res) => {
  res.contentType('text/html; charset=utf-8')
  res.send(`
<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.api.fileServerHits} times!</p>
  </body>
</html>`);
};
