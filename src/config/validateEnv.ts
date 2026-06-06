const REQUIRED_VARS = ["DATABASE_URL", "JWT_SECRET"] as const;

/** Strip channel_binding (unsupported by node-pg) and ensure sslmode for hosted Postgres. */
export function normalizeDatabaseUrl(url: string): string {
  let normalized = url.trim();

  normalized = normalized.replace(/&?channel_binding=require/gi, "");
  normalized = normalized.replace(/\?&/, "?").replace(/[?&]$/, "");

  return normalized;
}

/** @deprecated Use normalizeDatabaseUrl */
export const normalizeNeonDatabaseUrl = normalizeDatabaseUrl;

function usesConnectionPooler(url: string): boolean {
  return url.includes("-pooler") || /pooler\.supabase\.com/i.test(url);
}

function applyNormalizedDatabaseUrl(): void {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) {
    return;
  }

  process.env.DATABASE_URL = normalizeDatabaseUrl(raw);
}

/** Default production mode on Vercel when NODE_ENV is unset. */
function applyVercelDefaults(): void {
  if (process.env.VERCEL && !process.env.NODE_ENV) {
    process.env.NODE_ENV = "production";
  }
}

function stripEnvQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function normalizeQuotedSecrets(): void {
  if (process.env.JWT_SECRET) {
    process.env.JWT_SECRET = stripEnvQuotes(process.env.JWT_SECRET);
  }
}

export function loadEnvironment(): void {
  applyVercelDefaults();
  normalizeQuotedSecrets();
  applyNormalizedDatabaseUrl();
}

export function validateEnvironment(): void {
  const missing = REQUIRED_VARS.filter((name) => !process.env[name]?.trim());

  if (missing.length > 0) {
    throw new Error(
      `Missing environment variables: ${missing.join(", ")}. ` +
        "Local: copy .env.example → .env. Vercel: Settings → Environment Variables."
    );
  }

  const dbUrl = process.env.DATABASE_URL!.trim();
  const jwtSecret = process.env.JWT_SECRET!.trim();

  if (!/^postgres(ql)?:\/\//i.test(dbUrl)) {
    throw new Error(
      "DATABASE_URL must be a PostgreSQL connection string (postgresql://...)."
    );
  }

  if (!/\.neon\.tech|\.supabase\.(com|co)/i.test(dbUrl)) {
    console.warn(
      "[env] Warning: DATABASE_URL host is not Neon or Supabase — ensure SSL and pooling are configured."
    );
  }

  if (!usesConnectionPooler(dbUrl)) {
    console.warn(
      "[env] Warning: use a pooled connection string on Vercel " +
        "(Neon: -pooler host, Supabase: pooler.supabase.com)."
    );
  }

  if (jwtSecret.length < 32) {
    throw new Error(
      `JWT_SECRET must be at least 32 characters (got ${jwtSecret.length}). ` +
        "Use letters/numbers only — avoid + and = in .env files."
    );
  }

  if (/[+=%]/.test(jwtSecret)) {
    console.warn(
      "[env] Warning: JWT_SECRET contains +, =, or %. These can break .env parsing — use alphanumeric only."
    );
  }

  if (process.env.VERCEL && process.env.NODE_ENV !== "production") {
    console.warn("[env] Warning: On Vercel, set NODE_ENV=production in Environment Variables.");
  }
}
