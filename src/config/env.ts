import dotenv from "dotenv";

if (!process.env.VERCEL) {
  dotenv.config();
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
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
  get isSupabase(): boolean {
    return (process.env.DATABASE_URL || "").includes("supabase");
  },
  get isVercel(): boolean {
    return Boolean(process.env.VERCEL);
  },
};
