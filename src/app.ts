import express from "express";
import cors from "cors";
import pool from "./config/db";
import authRoutes from "./routes/authRoutes";
import { asyncHandler } from "./middleware/asyncHandler";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { sendSuccess, sendError } from "./utils/response";
import { StatusCodes } from "http-status-codes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("DevPulse Server Running");
});

app.get(
  "/api/health",
  asyncHandler(async (_req, res) => {
    try {
      await pool.query("SELECT 1");
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

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
