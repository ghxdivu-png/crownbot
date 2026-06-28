import { Client, TextChannel, EmbedBuilder } from "discord.js";
import { ScheduledMessage } from "../database/models/ScheduledMessage.js";
import { isDbConnected } from "../database/connection.js";
import { logger } from "../../lib/logger.js";

const TICK_INTERVAL = 30_000; // Check every 30 seconds
let timer: ReturnType<typeof setInterval> | null = null;

export class SchedulerService {
  static start(client: Client): void {
    if (timer) clearInterval(timer);
    timer = setInterval(() => SchedulerService.tick(client), TICK_INTERVAL);
    logger.info("Scheduler service started");
    // Run immediately on start
    SchedulerService.tick(client);
  }

  static stop(): void {
    if (timer) { clearInterval(timer); timer = null; }
  }

  private static async tick(client: Client): Promise<void> {
    if (!isDbConnected()) return;
    try {
      const now = new Date();
      const due = await ScheduledMessage.find({ paused: false, nextRunAt: { $lte: now } });
      for (const msg of due) {
        await SchedulerService.send(client, msg);
        if (msg.recurring && msg.intervalMs) {
          msg.lastRunAt = now;
          msg.nextRunAt = new Date(now.getTime() + msg.intervalMs);
          msg.runCount += 1;
          await msg.save();
        } else {
          await ScheduledMessage.deleteOne({ _id: msg._id });
        }
      }
    } catch (err) {
      logger.error({ err }, "Scheduler tick error");
    }
  }

  private static async send(client: Client, msg: any): Promise<void> {
    try {
      const guild = client.guilds.cache.get(msg.guildId);
      if (!guild) return;
      const channel = guild.channels.cache.get(msg.channelId) as TextChannel | null;
      if (!channel) return;

      const payload: { content?: string; embeds?: EmbedBuilder[] } = {};
      if (msg.content) payload.content = msg.content;
      if (msg.embedTitle || msg.embedDescription) {
        const embed = new EmbedBuilder()
          .setColor(msg.embedColor ?? 0x5865F2)
          .setTimestamp();
        if (msg.embedTitle) embed.setTitle(msg.embedTitle);
        if (msg.embedDescription) embed.setDescription(msg.embedDescription);
        if (msg.embedFooter) embed.setFooter({ text: msg.embedFooter });
        if (msg.embedImage) embed.setImage(msg.embedImage);
        payload.embeds = [embed];
      }
      if (!payload.content && !payload.embeds) return;
      await channel.send(payload);
      logger.info({ label: msg.label, guildId: msg.guildId }, "Scheduled message sent");
    } catch (err) {
      logger.error({ err, label: msg.label }, "Failed to send scheduled message");
    }
  }
}
