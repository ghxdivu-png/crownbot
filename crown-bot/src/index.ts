import app from "./app.js";
import { logger } from "./lib/logger.js";
import { startBot } from "./bot/bot.js";
import { connectDatabase } from "./bot/database/connection.js";

const rawPort = process.env["PORT"];
if (!rawPort) throw new Error("PORT environment variable is required but was not provided.");
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT value: "${rawPort}"`);

// Connect database first (non-blocking — bot/server start regardless)
connectDatabase().catch((err) => logger.error({ err }, "Database startup error"));

// Start Discord bot (non-blocking)
startBot().catch((err) => logger.error({ err }, "Failed to start Discord bot"));

app.listen(port, (err) => {
  if (err) { logger.error({ err }, "Error listening on port"); process.exit(1); }
  logger.info({ port }, "Server listening");
});
