import { Events, GuildMember, TextChannel } from "discord.js";
import { getSettings } from "../prefix/store.js";
import { embed } from "../prefix/embeds.js";
import { checkRaid, isRaidLocked } from "../prefix/automod.js";
import { logger } from "../../lib/logger.js";

export const name = Events.GuildMemberAdd;
export const once = false;

export async function execute(member: GuildMember): Promise<void> {
  const { guild } = member;
  const settings = getSettings(guild.id);

  // Anti-raid check
  const raidDetected = checkRaid();
  if (raidDetected || isRaidLocked()) {
    await member.kick("Anti-raid: too many joins in a short window").catch(() => {});
    logger.warn({ userId: member.id, guildId: guild.id }, "Anti-raid kick triggered");
    return;
  }

  // Auto role
  if (settings.autoRole) {
    const role = guild.roles.cache.get(settings.autoRole);
    if (role) await member.roles.add(role).catch(() => {});
  }

  // Welcome message
  if (!settings.welcomeChannel) return;
  const ch = guild.channels.cache.get(settings.welcomeChannel);
  if (!ch || !(ch instanceof TextChannel)) return;

  const memberCount = guild.memberCount;
  await ch.send({
    content: `${member}`,
    embeds: [embed({
      title: `👋 Welcome to ${guild.name}!`,
      description:
        `Hey ${member}, glad you're here! 🎉\n\n` +
        `You are member **#${memberCount}**!\n` +
        `Read the rules, vibe with us, and have fun. 👑`,
      thumbnail: member.user.displayAvatarURL({ size: 256 }),
      color: 0x57F287,
    })],
  }).catch(() => {});
}
