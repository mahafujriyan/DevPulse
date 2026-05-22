import { dbQuery } from "../config/db";
import type { IssueStatus, IssueType, JwtPayload } from "../types";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../utils/errors";
import {
  validateEnum,
  validateOptionalEnum,
  validateRequiredString,
} from "../utils/validation";

const ISSUE_TYPES = ["bug", "feature_request"] as const;
const ISSUE_STATUSES = ["open", "in_progress", "resolved"] as const;
const SORT_OPTIONS = ["newest", "oldest"] as const;

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

  const usersResult = await dbQuery(
    `SELECT id, name, role
     FROM users
     WHERE id IN (${placeholders})`,
    reporterIds
  );

  const reporterMap = new Map<number, ReporterSummary>(
    usersResult.rows.map((user) => [
      user.id as number,
      user as ReporterSummary,
    ])
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

  const result = await dbQuery(
    `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
     FROM issues
     ${whereClause}
     ORDER BY created_at ${orderDirection}`,
    values
  );

  return attachReporters(result.rows as IssueRow[]);
}

export async function getIssueById(issueId: number) {
  const issue = await findIssueRowById(issueId);
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

  const userCheck = await dbQuery(
    `SELECT id FROM users WHERE id = $1`,
    [reporterId]
  );

  if (userCheck.rows.length === 0) {
    throw new NotFoundError("Reporter user not found");
  }

  const result = await dbQuery(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    [input.title, input.description, input.type, reporterId]
  );

  return result.rows[0];
}

async function findIssueRowById(issueId: number): Promise<IssueRow> {
  const result = await dbQuery(
    `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
     FROM issues
     WHERE id = $1`,
    [issueId]
  );

  const issue = result.rows[0];

  if (!issue) {
    throw new NotFoundError("Issue not found");
  }

  return issue as IssueRow;
}

export async function updateIssue(
  issueId: number,
  body: unknown,
  user: JwtPayload
) {
  if (!body || typeof body !== "object") {
    throw new BadRequestError("Invalid request body");
  }

  const issue = await findIssueRowById(issueId);
  const payload = body as Record<string, unknown>;

  if (user.role === "contributor") {
    if (issue.reporter_id !== user.id) {
      throw new ForbiddenError("You can only update your own issues");
    }

    if (issue.status !== "open") {
      throw new ConflictError("Only open issues can be updated by contributors");
    }

    if (payload.status !== undefined) {
      throw new ForbiddenError("Only maintainers can update issue status");
    }
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (payload.title !== undefined) {
    values.push(
      validateRequiredString(payload.title, "Title", { maxLength: 150 })
    );
    updates.push(`title = $${values.length}`);
  }

  if (payload.description !== undefined) {
    values.push(
      validateRequiredString(payload.description, "Description", {
        minLength: 20,
      })
    );
    updates.push(`description = $${values.length}`);
  }

  if (payload.type !== undefined) {
    values.push(validateEnum(payload.type, ISSUE_TYPES, "Type"));
    updates.push(`type = $${values.length}`);
  }

  if (payload.status !== undefined) {
    if (user.role !== "maintainer") {
      throw new ForbiddenError("Only maintainers can update issue status");
    }

    values.push(validateEnum(payload.status, ISSUE_STATUSES, "Status"));
    updates.push(`status = $${values.length}`);
  }

  if (updates.length === 0) {
    throw new BadRequestError("At least one field must be provided to update");
  }

  values.push(issueId);

  const result = await dbQuery(
    `UPDATE issues
     SET ${updates.join(", ")}
     WHERE id = $${values.length}
     RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    values
  );

  return result.rows[0];
}

export async function deleteIssue(issueId: number, user: JwtPayload) {
  if (user.role !== "maintainer") {
    throw new ForbiddenError("Only maintainers can delete issues");
  }

  const result = await dbQuery(
    `DELETE FROM issues
     WHERE id = $1
     RETURNING id`,
    [issueId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("Issue not found");
  }
}
