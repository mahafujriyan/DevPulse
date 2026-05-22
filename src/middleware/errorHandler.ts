import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/errors";
import { sendError } from "../utils/response";

export function notFoundHandler(_req: Request, res: Response): Response {
  return sendError(res, {
    statusCode: StatusCodes.NOT_FOUND,
    message: "Route not found",
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (err instanceof AppError) {
    return sendError(res, {
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
  }

  if (err instanceof SyntaxError && "body" in err) {
    return sendError(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      message: "Invalid JSON in request body",
    });
  }

  const message = err instanceof Error ? err.message : "Internal server error";

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  return sendError(res, {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message,
  });
}
