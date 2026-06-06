import { Router } from "express";
import { login, signup } from "./auth.controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { methodNotAllowed } from "../../middleware/methodNotAllowed";

const router = Router();

router.get("/signup", methodNotAllowed("POST", "/api/auth/signup"));
router.post("/signup", asyncHandler(signup));
router.get("/login", methodNotAllowed("POST", "/api/auth/login"));
router.post("/login", asyncHandler(login));

export default router;
