import { EmbedBuilder, ColorResolvable } from "discord.js";

const COLORS: number[] = [0x5865F2, 0x57F287, 0xEB459E, 0xFEE75C, 0x3498DB, 0x9B59B6, 0xE67E22];
const FOOTER = "Crown Bot 👑 | Made with love";

export function randColor(): ColorResolvable {
  return COLORS[Math.floor(Math.random() * COLORS.length)] as ColorResolvable;
}

export function embed(opts: {
  title?: string;
  description?: string;
  color?: ColorResolvable;
  fields?: { name: string; value: string; inline?: boolean }[];
  thumbnail?: string;
  image?: string;
  footer?: string;
  timestamp?: boolean;
}): EmbedBuilder {
  const e = new EmbedBuilder()
    .setColor(opts.color ?? randColor())
    .setFooter({ text: opts.footer ?? FOOTER })
    .setTimestamp(opts.timestamp !== false ? new Date() : null);
  if (opts.title) e.setTitle(opts.title);
  if (opts.description) e.setDescription(opts.description);
  if (opts.fields?.length) e.addFields(opts.fields);
  if (opts.thumbnail) e.setThumbnail(opts.thumbnail);
  if (opts.image) e.setImage(opts.image);
  return e;
}

export function successEmbed(description: string): EmbedBuilder {
  return embed({ description: `✅ ${description}`, color: 0x57F287 });
}

export function errorEmbed(description: string): EmbedBuilder {
  return embed({ description: `❌ ${description}`, color: 0xED4245 });
}

export function infoEmbed(title: string, description: string): EmbedBuilder {
  return embed({ title, description, color: 0x5865F2 });
}
