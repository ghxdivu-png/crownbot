import { Guild, EmbedBuilder, TextChannel } from "discord.js";
import { Colors } from "./embeds.js";

const ACTION_COLORS: Record<string, number> = {
  ban: 0xed4245,
  unban: 0x57f287,
  kick: 0xe67e22,
  warn: 0xfee75c,
  timeout: 0xf0a500,
  untimeout: 0x57f287,
  clear: 0x5865f2,
  lock: 0x99aab5,
  unlock: 0x57f287,
  slowmode: 0x99aab5,
};

export interface ModLogEntry {
  action: string;
  userId: string;
  guildId: string;
  username?: string;
  moderatorId: string;
  moderatorTag: string;
  reason: string;
  duration?: string;
}

/**
 * Posts a moderation action embed to a log channel if the bot has a channel
 * configured via the BOT_LOG_CHANNEL_ID environment variable.
 */
export async function logModAction(guild: Guild, entry: ModLogEntry): Promise<void> {
  const channelId = process.env.BOT_LOG_CHANNEL_ID;
  if (!channelId) return;

  try {
    const channel = guild.channels.cache.get(channelId) as TextChannel | undefined;
    if (!channel?.isTextBased()) return;

    const color = ACTION_COLORS[entry.action.toLowerCase()] ?? Colors.neutral;

    const embed = new EmbedBuilder()
      .setColor(color as number)
      .setTitle(`Moderation: ${entry.action.toUpperCase()}`)
      .addFields(
        { name: "User", value: `<@${entry.userId}> (${entry.username ?? entry.userId})`, inline: true },
        { name: "Moderator", value: `<@${entry.moderatorId}> (${entry.moderatorTag})`, inline: true },
        { name: "Reason", value: entry.reason },
      )
      .setTimestamp();

    if (entry.duration) {
      embed.addFields({ name: "Duration", value: entry.duration, inline: true });
    }

    await channel.send({ embeds: [embed] });
  } catch {
    // Silently fail — log channel posting is best-effort
  }
}
