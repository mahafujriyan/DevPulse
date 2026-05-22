import bcrypt from "bcrypt";
import pool from "../config/db";
import type { UserRole } from "../types";
import { BadRequestError, ConflictError } from "../utils/errors";
import {
  validateEmail,
  validateEnum,
  validateRequiredString,
} from "../utils/validation";

const BCRYPT_ROUNDS = 10;
const USER_ROLES = ["contributor", "maintainer"] as const;

interface SignupInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export async function registerUser(body: unknown) {
  if (!body || typeof body !== "object") {
    throw new BadRequestError("Invalid request body");
  }

  const payload = body as Record<string, unknown>;

  const input: SignupInput = {
    name: validateRequiredString(payload.name, "Name"),
    email: validateEmail(payload.email),
    password: validateRequiredString(payload.password, "Password"),
    role: validateEnum(payload.role, USER_ROLES, "Role"),
  };

  const hashedPassword = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at, updated_at`,
      [input.name, input.email, hashedPassword, input.role]
    );

    return result.rows[0];
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "23505"
    ) {
      throw new ConflictError("Email already registered");
    }

    throw error;
  }
}
