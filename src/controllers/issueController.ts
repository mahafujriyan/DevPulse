import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  createIssue,
  deleteIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
} from "../services/issueService";
import { BadRequestError, UnauthorizedError } from "../utils/errors";
import { sendSuccess } from "../utils/response";

export async function createIssueHandler(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }

  const issue = await createIssue(req.body, req.user.id);

  sendSuccess(res, {
    statusCode: StatusCodes.CREATED,
    message: "Issue created successfully",
    data: issue,
  });
}

export async function getAllIssuesHandler(req: Request, res: Response): Promise<void> {
  const issues = await getAllIssues(req.query as Record<string, string>);

  sendSuccess(res, { data: issues });
}

export async function getIssueByIdHandler(req: Request, res: Response): Promise<void> {
  const issueId = Number(req.params.id);

  if (!Number.isInteger(issueId) || issueId <= 0) {
    throw new BadRequestError("Invalid issue id");
  }

  const issue = await getIssueById(issueId);

  sendSuccess(res, { data: issue });
}

export async function updateIssueHandler(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }

  const issueId = Number(req.params.id);

  if (!Number.isInteger(issueId) || issueId <= 0) {
    throw new BadRequestError("Invalid issue id");
  }

  const issue = await updateIssue(issueId, req.body, req.user);

  sendSuccess(res, {
    message: "Issue updated successfully",
    data: issue,
  });
}

export async function deleteIssueHandler(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }

  const issueId = Number(req.params.id);

  if (!Number.isInteger(issueId) || issueId <= 0) {
    throw new BadRequestError("Invalid issue id");
  }

  await deleteIssue(issueId, req.user);

  sendSuccess(res, {
    message: "Issue deleted successfully",
  });
}
