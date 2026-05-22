import type { Response } from "express";
import { StatusCodes } from "http-status-codes";

interface SuccessOptions {
  message?: string;
  data?: unknown;
  statusCode?: number;
}

interface ErrorOptions {
  message: string;
  errors?: unknown;
  statusCode?: number;
}

export function sendSuccess(res: Response, options: SuccessOptions = {}): Response {
  const { message, data, statusCode = StatusCodes.OK } = options;

  const body: Record<string, unknown> = { success: true };

  if (message) {
    body.message = message;
  }

  if (data !== undefined) {
    body.data = data;
  }

  return res.status(statusCode).json(body);
}

export function sendError(res: Response, options: ErrorOptions): Response {
  const { message, errors, statusCode = StatusCodes.BAD_REQUEST } = options;

  const body: Record<string, unknown> = {
    success: false,
    message,
  };

  if (errors !== undefined) {
    body.errors = errors;
  }

  return res.status(statusCode).json(body);
}
