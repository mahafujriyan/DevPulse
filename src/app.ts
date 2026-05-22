import express from "express";
import cors from "cors";
import { query } from "./config/db";
import authRoutes from "./routes/authRoutes";
import issueRoutes from "./routes/issueRoutes";
import { asyncHandler } from "./middleware/asyncHandler";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { sendSuccess, sendError } from "./utils/response";
import { StatusCodes } from "http-status-codes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "DevPulse API",
    data: {
      health: "/api/health",
      auth: "/api/auth",
      issues: "/api/issues",
      issuesInfo: "/api/issues/info",
    },
  });
});

app.get(
  "/api/health",
  asyncHandler(async (_req, res) => {
    try {
      await query("SELECT 1", [], 5000);
      sendSuccess(res, {
        message: "DevPulse API is healthy",
        data: { database: "connected" },
      });
    } catch {
      sendError(res, {
        statusCode: StatusCodes.SERVICE_UNAVAILABLE,
        message: "Database connection failed",
      });
    }
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
