import { Router } from "express";
import {
  createIssueHandler,
  getAllIssuesHandler,
  getIssueByIdHandler,
} from "../controllers/issueController";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/", asyncHandler(getAllIssuesHandler));
router.get("/:id", asyncHandler(getIssueByIdHandler));
router.post("/", authenticate, asyncHandler(createIssueHandler));

export default router;
