import { BadRequestError } from "./errors";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: unknown): string {
  if (typeof email !== "string" || !email.trim()) {
    throw new BadRequestError("Email is required");
  }

  const normalized = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(normalized)) {
    throw new BadRequestError("Invalid email format");
  }

  return normalized;
}

export function validateRequiredString(
  value: unknown,
  fieldName: string,
  options: { minLength?: number; maxLength?: number } = {}
): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new BadRequestError(`${fieldName} is required`);
  }

  const trimmed = value.trim();

  if (options.minLength !== undefined && trimmed.length < options.minLength) {
    throw new BadRequestError(
      `${fieldName} must be at least ${options.minLength} characters`
    );
  }

  if (options.maxLength !== undefined && trimmed.length > options.maxLength) {
    throw new BadRequestError(
      `${fieldName} must not exceed ${options.maxLength} characters`
    );
  }

  return trimmed;
}

export function validateEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fieldName: string
): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new BadRequestError(
      `${fieldName} must be one of: ${allowed.join(", ")}`
    );
  }

  return value as T;
}

export function validateOptionalEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fieldName: string
): T | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return validateEnum(value, allowed, fieldName);
}

export function stripPassword<T extends Record<string, unknown>>(user: T): Omit<T, "password"> {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}
