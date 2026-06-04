const REQUIRED_VARS = ["DATABASE_URL", "JWT_SECRET"] as const;

/** Strip channel_binding and fix Neon URL before the app uses DATABASE_URL. */
export function normalizeNeonDatabaseUrl(url: string): string {
  let normalized = url.trim();

  normalized = normalized.replace(/&?channel_binding=require/gi, "");
  normalized = normalized.replace(/\?&/, "?").replace(/[?&]$/, "");

  if (!/sslmode=/i.test(normalized) && /\.neon\.tech/i.test(normalized)) {
    const separator = normalized.includes("?") ? "&" : "?";
    normalized = `${normalized}${separator}sslmode=require`;
  }

  return normalized;
}

function applyNormalizedDatabaseUrl(): void {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) {
    return;
  }

  process.env.DATABASE_URL = normalizeNeonDatabaseUrl(raw);
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

  if (!/\.neon\.tech/i.test(dbUrl)) {
    throw new Error(
      "DATABASE_URL must be a Neon connection string (*.neon.tech). " +
        "Get it from Neon Dashboard → Connect → pooled URI."
    );
  }

  if (!dbUrl.includes("-pooler")) {
    console.warn(
      "[env] Warning: DATABASE_URL has no -pooler host. For Vercel, enable Connection pooling in Neon."
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
