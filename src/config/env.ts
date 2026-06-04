import dotenv from "dotenv";

if (!process.env.VERCEL) {
  dotenv.config();
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Set it in Vercel → Settings → Environment Variables (Neon DATABASE_URL).`
    );
  }
  return value;
}

function databaseUrlValue(): string {
  return process.env.DATABASE_URL || "";
}

/** Neon hosted Postgres (*.neon.tech) requires SSL connections. */
function isNeonDatabaseUrl(url: string): boolean {
  return /\.neon\.tech/i.test(url);
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
    return isNeonDatabaseUrl(databaseUrlValue());
  },
  get isNeon(): boolean {
    return isNeonDatabaseUrl(databaseUrlValue());
  },
  get isVercel(): boolean {
    return Boolean(process.env.VERCEL);
  },
};
