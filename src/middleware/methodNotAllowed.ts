import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { sendError } from "../utils/response";

export function methodNotAllowed(allowedMethod: string, endpoint: string) {
  return (_req: Request, res: Response, _next: NextFunction): Response => {
    return sendError(res, {
      statusCode: StatusCodes.METHOD_NOT_ALLOWED,
      message: `Use ${allowedMethod} method for this endpoint`,
      errors: {
        method: allowedMethod,
        endpoint,
      },
    });
  };
}
