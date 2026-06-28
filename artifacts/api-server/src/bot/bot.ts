import { Client, GatewayIntentBits, Partials } from "discord.js";
import { loadCommands } from "./handlers/commandHandler.js";
import { loadEvents } from "./handlers/eventHandler.js";
import { registerSlashCommands } from "./handlers/registerCommands.js";
import { logger } from "../lib/logger.js";

let discordClient: Client | null = null;

export async function startBot(): Promise<void> {
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    logger.warn("DISCORD_TOKEN not set — bot will not start");
    return;
  }

  await registerSlashCommands();

  discordClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildPresences,
    ],
    partials: [Partials.GuildMember, Partials.Message, Partials.Channel],
  });

  loadCommands(discordClient);
  loadEvents(discordClient);

  discordClient.on("error", (err) => logger.error({ err }, "Discord client error"));
  discordClient.on("warn", (info) => logger.warn({ info }, "Discord client warning"));
  process.on("unhandledRejection", (reason) => logger.error({ reason }, "Unhandled promise rejection"));

  await discordClient.login(token);
}

export function getClient(): Client | null {
  return discordClient;
}
