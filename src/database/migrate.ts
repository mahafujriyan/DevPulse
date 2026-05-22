import fs from "fs";
import path from "path";
import pool from "../config/db";

async function migrate(): Promise<void> {
  const schemaPath = path.join(__dirname, "../../database/schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf-8");

  console.log("Running database migration...");
  await pool.query(sql);
  console.log("Migration completed: users and issues tables are ready.");
}

migrate()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Migration failed:", message);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
