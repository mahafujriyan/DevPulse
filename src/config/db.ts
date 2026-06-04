import { Pool, type QueryResult } from "pg";
import { env } from "./env";

let pool: Pool | null = null;

/** Neon pooled URLs: strip channel_binding (unsupported by node-pg), enforce sslmode. */
function normalizeDatabaseUrl(url: string): string {
  let normalized = url.trim();

  normalized = normalized.replace(/&?channel_binding=require/gi, "");
  normalized = normalized.replace(/\?&/, "?").replace(/[?&]$/, "");

  if (!/sslmode=/i.test(normalized) && env.requiresSsl) {
    const separator = normalized.includes("?") ? "&" : "?";
    normalized = `${normalized}${separator}sslmode=require`;
  }

  if (!/connect_timeout=/i.test(normalized)) {
    const separator = normalized.includes("?") ? "&" : "?";
    normalized = `${normalized}${separator}connect_timeout=10`;
  }

  return normalized;
}

function getPool(): Pool {
  if (pool) {
    return pool;
  }

  const connectionString = normalizeDatabaseUrl(env.databaseUrl);

  pool = new Pool({
    connectionString,
    ssl: env.requiresSsl ? { rejectUnauthorized: false } : undefined,
    max: env.isVercel ? 1 : 10,
    idleTimeoutMillis: env.isVercel ? 1000 : 30000,
    connectionTimeoutMillis: 10000,
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
