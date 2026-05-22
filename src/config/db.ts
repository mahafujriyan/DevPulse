import { Pool, type QueryResult } from "pg";
import { env } from "./env";

let pool: Pool | null = null;

function buildConnectionString(url: string): string {
  if (url.includes("connect_timeout")) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}connect_timeout=5`;
}

function getPool(): Pool {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    connectionString: buildConnectionString(env.databaseUrl),
    ssl: env.isSupabase ? { rejectUnauthorized: false } : undefined,
    max: env.isVercel ? 1 : 10,
    idleTimeoutMillis: env.isVercel ? 1000 : 30000,
    connectionTimeoutMillis: 5000,
    allowExitOnIdle: env.isVercel,
  });

  pool.on("error", (err: Error) => {
    console.error("Unexpected PostgreSQL pool error:", err.message);
  });

  return pool;
}

export async function dbQuery(
  text: string,
  params: unknown[] = [],
  timeoutMs = 8000
): Promise<QueryResult> {
  const queryPromise = getPool().query(text, params);
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Database query timed out")), timeoutMs);
  });

  return Promise.race([queryPromise, timeoutPromise]);
}

export async function testDbConnection(): Promise<void> {
  await dbQuery("SELECT 1", [], 5000);
}

export default getPool;
