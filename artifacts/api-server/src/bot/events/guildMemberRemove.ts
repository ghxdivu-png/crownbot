import { Events, GuildMember, PartialGuildMember, TextChannel } from "discord.js";
import { getSettings } from "../prefix/store.js";
import { embed } from "../prefix/embeds.js";

export const name = Events.GuildMemberRemove;
export const once = false;

export async function execute(member: GuildMember | PartialGuildMember): Promise<void> {
  const { guild } = member;
  const settings = getSettings(guild.id);
  if (!settings.goodbyeChannel) return;

  const ch = guild.channels.cache.get(settings.goodbyeChannel);
  if (!ch || !(ch instanceof TextChannel)) return;

  await ch.send({
    embeds: [embed({
      title: "👋 Goodbye!",
      description: `**${member.user?.tag ?? "Someone"}** just left the server.\nWe'll miss you! 💔`,
      thumbnail: member.user?.displayAvatarURL({ size: 256 }) ?? undefined,
      color: 0xED4245,
    })],
  }).catch(() => {});
}
