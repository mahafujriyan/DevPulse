import pool from "../config/db";
import type { IssueStatus, IssueType } from "../types";
import { BadRequestError, NotFoundError } from "../utils/errors";
import {
  validateEnum,
  validateOptionalEnum,
  validateRequiredString,
} from "../utils/validation";

const ISSUE_TYPES = ["bug", "feature_request"] as const;
const ISSUE_STATUSES = ["open", "in_progress", "resolved"] as const;
const SORT_OPTIONS = ["newest", "oldest"] as const;

type SortOption = (typeof SORT_OPTIONS)[number];

interface CreateIssueInput {
  title: string;
  description: string;
  type: IssueType;
}

interface IssueQueryParams {
  sort?: string;
  type?: string;
  status?: string;
}

interface IssueRow {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

interface ReporterSummary {
  id: number;
  name: string;
  role: string;
}

async function attachReporters(issues: IssueRow[]) {
  if (issues.length === 0) {
    return [];
  }

  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];
  const placeholders = reporterIds.map((_, index) => `$${index + 1}`).join(", ");

  const usersResult = await pool.query(
    `SELECT id, name, role
     FROM users
     WHERE id IN (${placeholders})`,
    reporterIds
  );

  const reporterMap = new Map<number, ReporterSummary>(
    usersResult.rows.map((user) => [user.id, user])
  );

  return issues.map((issue) => {
    const reporter = reporterMap.get(issue.reporter_id);

    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: {
        id: issue.reporter_id,
        name: reporter?.name ?? "Unknown",
        role: reporter?.role ?? "contributor",
      },
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    };
  });
}

export async function getAllIssues(query: IssueQueryParams) {
  const sort = validateOptionalEnum(query.sort ?? "newest", SORT_OPTIONS, "Sort") ?? "newest";
  const type = validateOptionalEnum(query.type, ISSUE_TYPES, "Type");
  const status = validateOptionalEnum(query.status, ISSUE_STATUSES, "Status");

  const conditions: string[] = [];
  const values: string[] = [];

  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderDirection = sort === "oldest" ? "ASC" : "DESC";

  const result = await pool.query(
    `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
     FROM issues
     ${whereClause}
     ORDER BY created_at ${orderDirection}`,
    values
  );

  return attachReporters(result.rows);
}

export async function getIssueById(issueId: number) {
  const result = await pool.query(
    `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
     FROM issues
     WHERE id = $1`,
    [issueId]
  );

  const issue = result.rows[0];

  if (!issue) {
    throw new NotFoundError("Issue not found");
  }

  const [formattedIssue] = await attachReporters([issue]);
  return formattedIssue;
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
