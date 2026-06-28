import { EmbedBuilder, ColorResolvable } from "discord.js";

export const Colors = {
  success: 0x57f287 as ColorResolvable,
  error: 0xed4245 as ColorResolvable,
  warning: 0xfee75c as ColorResolvable,
  info: 0x5865f2 as ColorResolvable,
  neutral: 0x99aab5 as ColorResolvable,
  timeout: 0xf0a500 as ColorResolvable,
};

export function successEmbed(title: string, description?: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(Colors.success)
    .setTitle(`✅ ${title}`)
    .setTimestamp();
  if (description) embed.setDescription(description);
  return embed;
}

export function errorEmbed(title: string, description?: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(Colors.error)
    .setTitle(`❌ ${title}`)
    .setTimestamp();
  if (description) embed.setDescription(description);
  return embed;
}

export function warnEmbed(title: string, description?: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(Colors.warning)
    .setTitle(`⚠️ ${title}`)
    .setTimestamp();
  if (description) embed.setDescription(description);
  return embed;
}

export function infoEmbed(title: string, description?: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(Colors.info)
    .setTitle(`ℹ️ ${title}`)
    .setTimestamp();
  if (description) embed.setDescription(description);
  return embed;
}

export function modEmbed(
  action: string,
  target: string,
  moderator: string,
  reason: string,
  extra?: Record<string, string>
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(Colors.info)
    .setTitle(`🔨 ${action}`)
    .addFields(
      { name: "User", value: target, inline: true },
      { name: "Moderator", value: moderator, inline: true },
      { name: "Reason", value: reason }
    )
    .setTimestamp();

  if (extra) {
    for (const [name, value] of Object.entries(extra)) {
      embed.addFields({ name, value, inline: true });
    }
  }

  return embed;
}
