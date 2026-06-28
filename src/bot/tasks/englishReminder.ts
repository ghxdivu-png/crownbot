import { Client, EmbedBuilder, TextChannel, AttachmentBuilder } from "discord.js";
import { logger } from "../../lib/logger.js";
import path from "path";
import { fileURLToPath } from "url";

const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const IMAGE_PATH = path.join(process.cwd(), "assets", "english-only.png");

export function startEnglishReminder(client: Client): void {
  const channelId = process.env.REMINDER_CHANNEL_ID;
  if (!channelId) {
    logger.warn("REMINDER_CHANNEL_ID not set — English-only reminder will not run");
    return;
  }

  const send = async () => {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel || !(channel instanceof TextChannel)) {
        logger.warn({ channelId }, "Reminder channel not found or not a text channel");
        return;
      }

      const attachment = new AttachmentBuilder(IMAGE_PATH, { name: "english-only.png" });

      const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle("📢 English Only Reminder")
        .setDescription(
          "To keep Crown's Legacy welcoming and easy for everyone to understand, please communicate in **English only** in all public channels.\n\n" +
          "🚫 Messages in other languages are not allowed.\n" +
          "⏰ Violating this rule may result in a **1-day timeout**.\n\n" +
          "Thank you for helping keep our community friendly, organized, and enjoyable for everyone. 👑💛"
        )
        .setImage("attachment://english-only.png")
        .setFooter({ text: "Crown's Legacy • Automatic Reminder" })
        .setTimestamp();

      await channel.send({ embeds: [embed], files: [attachment] });
      logger.info({ channelId }, "English-only reminder sent");
    } catch (err) {
      logger.error({ err, channelId }, "Failed to send English-only reminder");
    }
  };

  // Send once immediately on startup, then every 15 minutes
  send();
  setInterval(send, INTERVAL_MS);
  logger.info({ channelId, intervalMinutes: 15 }, "English-only reminder task started");
}
