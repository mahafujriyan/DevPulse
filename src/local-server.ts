/**
 * Local development only — do NOT name this server.ts (Vercel auto-detects src/server.ts).
 */
import app from "./application";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
