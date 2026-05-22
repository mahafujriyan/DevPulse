import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { JwtPayload, UserRole } from "../types";
import { ForbiddenError, UnauthorizedError } from "../utils/errors";

function extractToken(authHeader: string | undefined): string {
  if (!authHeader || !authHeader.trim()) {
    throw new UnauthorizedError("Authentication token is required");
  }

  const header = authHeader.trim();

  if (header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }

  return header;
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const token = extractToken(req.headers.authorization);

    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;

    if (!decoded.id || !decoded.name || !decoded.role) {
      throw new UnauthorizedError("Invalid token payload");
    }

    req.user = {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }

    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Token has expired");
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError("Invalid or malformed token");
    }

    throw error;
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }

    next();
  };
}
