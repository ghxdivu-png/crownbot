import { Guild, User, TextChannel } from "discord.js";
import { getSettings } from "./store.js";
import { embed } from "./embeds.js";

export async function sendModLog(
  guild: Guild,
  action: string,
  target: User,
  reason: string,
  moderator: string | User,
  extra?: string
): Promise<void> {
  const settings = getSettings(guild.id);
  if (!settings.modLogChannel) return;
  try {
    const ch = await guild.channels.fetch(settings.modLogChannel);
    if (!ch || !(ch instanceof TextChannel)) return;
    const modName = typeof moderator === "string" ? moderator : moderator.tag;
    const e = embed({
      title: action,
      color: 0xEB459E,
      fields: [
        { name: "Target", value: `${target.tag} (${target.id})`, inline: true },
        { name: "Moderator", value: modName, inline: true },
        { name: "Reason", value: reason || "No reason", inline: false },
        ...(extra ? [{ name: "Extra", value: extra, inline: false }] : []),
      ],
      timestamp: true,
    });
    e.setThumbnail(target.displayAvatarURL());
    await ch.send({ embeds: [e] });
  } catch { /* mod log channel may not exist yet */ }
}
