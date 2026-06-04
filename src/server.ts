/**
 * Local development only — starts HTTP server with app.listen().
 * Vercel uses api/index.js (no listen).
 */
import app from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
