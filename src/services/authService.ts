import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db";
import { env } from "../config/env";
import type { JwtPayload, UserRole } from "../types";
import { BadRequestError, ConflictError, UnauthorizedError } from "../utils/errors";
import {
  validateEmail,
  validateEnum,
  validateRequiredString,
  stripPassword,
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

interface LoginInput {
  email: string;
  password: string;
}

export async function loginUser(body: unknown) {
  if (!body || typeof body !== "object") {
    throw new BadRequestError("Invalid request body");
  }

  const payload = body as Record<string, unknown>;

  const input: LoginInput = {
    email: validateEmail(payload.email),
    password: validateRequiredString(payload.password, "Password"),
  };

  const result = await pool.query(
    `SELECT id, name, email, password, role, created_at, updated_at
     FROM users
     WHERE email = $1`,
    [input.email]
  );

  const user = result.rows[0];

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const passwordMatch = await bcrypt.compare(input.password, user.password);

  if (!passwordMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const tokenPayload: JwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role as UserRole,
  };

  const token = jwt.sign(tokenPayload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });

  return {
    token,
    user: stripPassword(user),
  };
}
