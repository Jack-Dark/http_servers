import type { Request, Response } from "express";

export const handlerReadiness = (_req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.send('OK');
};
