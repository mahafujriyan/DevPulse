import app from "./app";
import { env } from "./config/env";
import { testDbConnection } from "./config/db";

async function startServer(): Promise<void> {
  try {
    await testDbConnection();
    console.log("PostgreSQL connected successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to connect to PostgreSQL:", message);
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

startServer();
