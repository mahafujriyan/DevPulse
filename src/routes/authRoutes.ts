import { Router } from "express";
import { getProfile, login, signup } from "../controllers/authController";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/authMiddleware";
import { sendSuccess } from "../utils/response";

const router = Router();

router.get("/", (_req, res) => {
  sendSuccess(res, {
    message: "DevPulse Auth API",
    data: {
      signup: "POST /api/auth/signup",
      login: "POST /api/auth/login",
      profile: "GET /api/auth/me",
    },
  });
});

router.post("/signup", asyncHandler(signup));
router.post("/login", asyncHandler(login));
router.get("/me", authenticate, asyncHandler(getProfile));

export default router;
