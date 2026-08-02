import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("[API Error]", err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";

  // Never expose stack traces in HTTP responses — they reveal implementation
  // details and internal paths. Stack is already printed to console above.
  res.status(status).json({
    success: false,
    error: message,
  });
}

export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
