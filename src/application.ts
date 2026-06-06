import express from "express";
import cors from "cors";
import { dbQuery } from "./config/db";
import { env } from "./config/env";
import { validateEnvironment } from "./config/validateEnv";
import authRoutes from "./modules/auth/auth.routes";
import issueRoutes from "./modules/issues/issues.routes";
import { asyncHandler } from "./middleware/asyncHandler";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { sendSuccess, sendError } from "./utils/response";
import { StatusCodes } from "http-status-codes";

validateEnvironment();

const app = express();

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "DevPulse API",
    data: {
      health: "/api/health",
      auth: {
        signup: "POST /api/auth/signup",
        login: "POST /api/auth/login",
      },
      issues: {
        list: "GET /api/issues",
        single: "GET /api/issues/:id",
        create: "POST /api/issues",
        update: "PATCH /api/issues/:id",
        delete: "DELETE /api/issues/:id",
      },
    },
  });
});

app.get(
  "/api/health",
  asyncHandler(async (_req, res) => {
    try {
      await dbQuery("SELECT 1", [], 5000);
      sendSuccess(res, {
        message: "DevPulse API is healthy",
        data: {
          database: "connected",
          environment: env.nodeEnv,
          provider: env.dbProvider,
        },
      });
    } catch (error) {
      const detail =
        !env.isProduction && error instanceof Error ? error.message : undefined;

      sendError(res, {
        statusCode: StatusCodes.SERVICE_UNAVAILABLE,
        message: "Database connection failed",
        errors: detail,
      });
    }
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
