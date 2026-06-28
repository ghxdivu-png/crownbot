import { Client, Events } from "discord.js";
import { logger } from "../../lib/logger.js";
import { startEnglishReminder } from "../tasks/englishReminder.js";
import { loadStore } from "../prefix/store.js";
import { SchedulerService } from "../services/SchedulerService.js";

export const name = Events.ClientReady;
export const once = true;

export async function execute(client: Client): Promise<void> {
  logger.info({ tag: client.user?.tag, guilds: client.guilds.cache.size }, "Discord bot ready");
  client.user?.setActivity("👑 Crown Bot | >help", { type: 3 }); // WATCHING

  // Initialize systems
  loadStore();
  startEnglishReminder(client);
  SchedulerService.start(client);

  logger.info("All startup systems initialized");
}
