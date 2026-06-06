import dotenv from "dotenv";
import { loadEnvironment } from "./validateEnv";

if (!process.env.VERCEL) {
  // override: true — .env must win over shell/IDE defaults (e.g. JWT_SECRET=test)
  dotenv.config({ override: true });
}

loadEnvironment();

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        "Local: .env file. Vercel: Settings → Environment Variables."
    );
  }
  return value;
}

function databaseUrlValue(): string {
  return process.env.DATABASE_URL || "";
}

export type DbProvider = "neon" | "supabase" | "other";

function getDbProvider(url: string): DbProvider {
  if (/\.neon\.tech/i.test(url)) {
    return "neon";
  }
  if (/\.supabase\.(com|co)/i.test(url)) {
    return "supabase";
  }
  return "other";
}

/** Neon and Supabase require SSL connections. */
function requiresSslConnection(url: string): boolean {
  return /\.neon\.tech|\.supabase\.(com|co)/i.test(url);
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  get isProduction(): boolean {
    return env.nodeEnv === "production";
  },
  get databaseUrl(): string {
    return requireEnv("DATABASE_URL");
  },
  get jwtSecret(): string {
    return requireEnv("JWT_SECRET");
  },
  jwtExpiresIn: process.env.JWT_EXPIRES_IN?.trim() || "7d",
  get requiresSsl(): boolean {
    return requiresSslConnection(databaseUrlValue());
  },
  get dbProvider(): DbProvider {
    return getDbProvider(databaseUrlValue());
  },
  /** @deprecated Use dbProvider === "neon" */
  get isNeon(): boolean {
    return getDbProvider(databaseUrlValue()) === "neon";
  },
  get isVercel(): boolean {
    return Boolean(process.env.VERCEL);
  },
};
