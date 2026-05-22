import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { createIssue } from "../services/issueService";
import { UnauthorizedError } from "../utils/errors";
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
