import { Router } from "express";
import { createIssueHandler } from "../controllers/issueController";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticate, asyncHandler(createIssueHandler));

export default router;
