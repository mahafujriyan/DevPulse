import { Pool } from "pg";
import { env } from "./env";

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.isSupabase ? { rejectUnauthorized: false } : undefined,
});

pool.on("error", (err: Error) => {
  console.error("Unexpected PostgreSQL pool error:", err.message);
});

export async function testDbConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
  } finally {
    client.release();
  }
}

export default pool;
