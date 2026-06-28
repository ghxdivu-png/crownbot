import { REST, Routes } from "discord.js";
import { logger } from "../../lib/logger.js";
import { getCommandsJSON } from "./commandHandler.js";

/**
 * Registers all slash commands with Discord's API.
 * Registers globally so commands appear in all guilds.
 */
export async function registerSlashCommands(): Promise<void> {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!token || !clientId) {
    throw new Error("DISCORD_TOKEN and DISCORD_CLIENT_ID must be set");
  }

  const commands = getCommandsJSON();
  const rest = new REST({ version: "10" }).setToken(token);

  logger.info({ count: commands.length }, "Registering slash commands with Discord");

  try {
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    logger.info("Slash commands registered successfully");
  } catch (err) {
    logger.error({ err }, "Failed to register slash commands");
    throw err;
  }
}
