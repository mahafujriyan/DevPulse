import pool from "../config/db";
import type { IssueType } from "../types";
import { BadRequestError, NotFoundError } from "../utils/errors";
import {
  validateEnum,
  validateRequiredString,
} from "../utils/validation";

const ISSUE_TYPES = ["bug", "feature_request"] as const;

interface CreateIssueInput {
  title: string;
  description: string;
  type: IssueType;
}

export async function createIssue(body: unknown, reporterId: number) {
  if (!body || typeof body !== "object") {
    throw new BadRequestError("Invalid request body");
  }

  const payload = body as Record<string, unknown>;

  const input: CreateIssueInput = {
    title: validateRequiredString(payload.title, "Title", { maxLength: 150 }),
    description: validateRequiredString(payload.description, "Description", {
      minLength: 20,
    }),
    type: validateEnum(payload.type, ISSUE_TYPES, "Type"),
  };

  const userCheck = await pool.query(
    `SELECT id FROM users WHERE id = $1`,
    [reporterId]
  );

  if (userCheck.rows.length === 0) {
    throw new NotFoundError("Reporter user not found");
  }

  const result = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    [input.title, input.description, input.type, reporterId]
  );

  return result.rows[0];
}
