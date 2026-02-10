import type { RequestHandler } from "express";

export const handlerReadiness: RequestHandler = (_req, res) => {
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.send('OK');
};
