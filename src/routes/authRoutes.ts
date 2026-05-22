import { Router } from "express";
import { getProfile, login, signup } from "../controllers/authController";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/signup", asyncHandler(signup));
router.post("/login", asyncHandler(login));
router.get("/me", authenticate, asyncHandler(getProfile));

export default router;
