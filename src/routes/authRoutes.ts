import { Router } from "express";
import { signup } from "../controllers/authController";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

router.post("/signup", asyncHandler(signup));

export default router;
