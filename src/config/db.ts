import { Pool, type QueryResult, type QueryResultRow } from "pg";
import { env } from "./env";

const isServerless = Boolean(process.env.VERCEL);

function buildConnectionString(): string {
  const url = env.databaseUrl;

  if (url.includes("connect_timeout")) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}connect_timeout=5`;
}

const pool = new Pool({
  connectionString: buildConnectionString(),
  ssl: env.isSupabase ? { rejectUnauthorized: false } : undefined,
  max: isServerless ? 1 : 10,
  idleTimeoutMillis: isServerless ? 1000 : 30000,
  connectionTimeoutMillis: 5000,
  allowExitOnIdle: isServerless,
});

pool.on("error", (err: Error) => {
  console.error("Unexpected PostgreSQL pool error:", err.message);
});

export async function query<R extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
  timeoutMs = 8000
): Promise<QueryResult<R>> {
  const queryPromise = pool.query<R>(text, params);
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Database query timed out")), timeoutMs);
  });

  return Promise.race([queryPromise, timeoutPromise]);
}

export async function testDbConnection(): Promise<void> {
  await query("SELECT 1");
}

export default pool;
