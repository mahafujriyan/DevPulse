import { Router } from "express";
import { getProfile, login, signup } from "../controllers/authController";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/authMiddleware";
import { methodNotAllowed } from "../middleware/methodNotAllowed";
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

router.get("/signup", methodNotAllowed("POST", "/api/auth/signup"));
router.post("/signup", asyncHandler(signup));
router.get("/login", methodNotAllowed("POST", "/api/auth/login"));
router.post("/login", asyncHandler(login));
router.get("/me", authenticate, asyncHandler(getProfile));

export default router;
