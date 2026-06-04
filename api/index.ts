/**
 * Vercel serverless entry — loads the compiled Express app from dist/
 * (avoids broken file-tracing when using src/app.ts directly on Vercel)
 */
import app from "../dist/app";

export default app;

export const config = {
  maxDuration: 30,
};
