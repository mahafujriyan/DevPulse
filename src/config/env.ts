import dotenv from "dotenv";

if (!process.env.VERCEL) {
  dotenv.config();
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Set it in Vercel → Settings → Environment Variables.`
    );
  }
  return value;
}

function databaseUrlValue(): string {
  return process.env.DATABASE_URL || "";
}

/** Neon, Supabase, and similar cloud Postgres hosts require SSL. */
function hostedPostgresRequiresSsl(url: string): boolean {
  return /neon\.tech|supabase\.co|elephantsql\.com/i.test(url);
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  get databaseUrl(): string {
    return requireEnv("DATABASE_URL");
  },
  get jwtSecret(): string {
    return requireEnv("JWT_SECRET");
  },
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  get requiresSsl(): boolean {
    return hostedPostgresRequiresSsl(databaseUrlValue());
  },
  get isNeon(): boolean {
    return databaseUrlValue().includes("neon.tech");
  },
  get isVercel(): boolean {
    return Boolean(process.env.VERCEL);
  },
};
