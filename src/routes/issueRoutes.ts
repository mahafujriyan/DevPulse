import { Router } from "express";
import {
  createIssueHandler,
  deleteIssueHandler,
  getAllIssuesHandler,
  getIssueByIdHandler,
  updateIssueHandler,
} from "../controllers/issueController";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/authMiddleware";
import { sendSuccess } from "../utils/response";

const router = Router();

router.get("/", asyncHandler(getAllIssuesHandler));

router.get("/info", (_req, res) => {
  sendSuccess(res, {
    message: "DevPulse Issues API",
    data: {
      list: "GET /api/issues",
      single: "GET /api/issues/:id",
      create: "POST /api/issues (auth required)",
      update: "PATCH /api/issues/:id (auth required)",
      delete: "DELETE /api/issues/:id (maintainer only)",
      filters: "?sort=newest|oldest&type=bug|feature_request&status=open|in_progress|resolved",
    },
  });
});

router.get("/:id", asyncHandler(getIssueByIdHandler));
router.post("/", authenticate, asyncHandler(createIssueHandler));
router.patch("/:id", authenticate, asyncHandler(updateIssueHandler));
router.delete("/:id", authenticate, asyncHandler(deleteIssueHandler));

export default router;
