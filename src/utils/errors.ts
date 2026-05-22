import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors?: unknown;

  constructor(
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    errors?: unknown
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, errors?: unknown) {
    super(message, StatusCodes.BAD_REQUEST, errors);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, StatusCodes.UNAUTHORIZED);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, StatusCodes.FORBIDDEN);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, StatusCodes.NOT_FOUND);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, errors?: unknown) {
    super(message, StatusCodes.CONFLICT, errors);
    this.name = "ConflictError";
  }
}
