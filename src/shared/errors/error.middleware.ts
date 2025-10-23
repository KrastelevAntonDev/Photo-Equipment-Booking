import { Request, Response, NextFunction } from 'express';

export interface HttpError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
}

export function errorHandler(err: HttpError, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status && Number.isInteger(err.status) ? err.status : 500;
  const body: Record<string, unknown> = {
    message: err.message || 'Internal Server Error',
  };
  if (process.env.NODE_ENV !== 'production') {
    body.stack = err.stack;
    if (err.code) body.code = err.code;
    if (err.details) body.details = err.details;
  }
  res.status(status).json(body);
}

export default errorHandler;