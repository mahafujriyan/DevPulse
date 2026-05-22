import express from "express";
import cors from "cors";
import pool from "./config/db";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("DevPulse Server Running");
});

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ success: true, message: "DevPulse API is healthy", database: "connected" });
  } catch {
    res.status(503).json({ success: false, message: "Database connection failed" });
  }
});

export default app;
