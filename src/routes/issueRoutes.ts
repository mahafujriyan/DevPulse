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

const router = Router();

router.get("/", asyncHandler(getAllIssuesHandler));
router.get("/:id", asyncHandler(getIssueByIdHandler));
router.post("/", authenticate, asyncHandler(createIssueHandler));
router.patch("/:id", authenticate, asyncHandler(updateIssueHandler));
router.delete("/:id", authenticate, asyncHandler(deleteIssueHandler));

export default router;
