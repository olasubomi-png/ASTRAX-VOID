import { Request, Response, NextFunction } from "express";
import { databaseFailureSummary, isDatabaseUnavailable } from "../lib/prisma.js";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (isDatabaseUnavailable(err)) {
    console.error(`✗ Database unavailable: ${databaseFailureSummary(err)}`);
    res.status(503).json({
      success: false,
      error: "Database unavailable",
    });
    return;
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";

  console.error(`[API Error] ${message}`);

  // Never expose stack traces in HTTP responses — they reveal implementation
  // details and internal paths.
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
