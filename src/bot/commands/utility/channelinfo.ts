import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ChannelType, GuildChannel } from "discord.js";

const CHANNEL_TYPE_NAMES: Partial<Record<ChannelType, string>> = {
  [ChannelType.GuildText]: "Text Channel",
  [ChannelType.GuildVoice]: "Voice Channel",
  [ChannelType.GuildCategory]: "Category",
  [ChannelType.GuildAnnouncement]: "Announcement Channel",
  [ChannelType.GuildStageVoice]: "Stage Channel",
  [ChannelType.GuildForum]: "Forum Channel",
  [ChannelType.PublicThread]: "Public Thread",
  [ChannelType.PrivateThread]: "Private Thread",
};

export const data = new SlashCommandBuilder()
  .setName("channelinfo")
  .setDescription("Get information about a channel")
  .addChannelOption((opt) =>
    opt.setName("channel").setDescription("Channel to inspect (defaults to current)")
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const raw = interaction.options.getChannel("channel") ?? interaction.channel;
  if (!raw) { await interaction.reply({ content: "Channel not found.", ephemeral: true }); return; }

  // Fetch the full GuildChannel for full property access
  const channel = raw instanceof GuildChannel ? raw : await interaction.guild?.channels.fetch(raw.id).catch(() => null);
  if (!channel) { await interaction.reply({ content: "Could not fetch channel info.", ephemeral: true }); return; }

  const typeName = CHANNEL_TYPE_NAMES[channel.type] ?? "Unknown";
  const createdTs = Math.floor((channel.createdTimestamp ?? Date.now()) / 1000);

  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle(`📋 Channel Info: #${channel.name}`)
    .addFields(
      { name: "ID", value: channel.id, inline: true },
      { name: "Type", value: typeName, inline: true },
      { name: "Created", value: `<t:${createdTs}:F>`, inline: true },
    );

  if ("topic" in channel && channel.topic) {
    embed.addFields({ name: "Topic", value: channel.topic });
  }
  if ("nsfw" in channel) {
    embed.addFields({ name: "NSFW", value: (channel as any).nsfw ? "Yes" : "No", inline: true });
  }
  if ("rateLimitPerUser" in channel && (channel as any).rateLimitPerUser) {
    embed.addFields({ name: "Slowmode", value: `${(channel as any).rateLimitPerUser}s`, inline: true });
  }

  embed.setTimestamp();
  await interaction.reply({ embeds: [embed] });
}
