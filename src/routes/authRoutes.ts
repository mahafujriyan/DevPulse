import { Router } from "express";
import { login, signup } from "../controllers/authController";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

router.post("/signup", asyncHandler(signup));
router.post("/login", asyncHandler(login));

export default router;
