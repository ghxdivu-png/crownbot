import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Colors } from "../../utils/embeds.js";

export const data = new SlashCommandBuilder()
  .setName("serverinfo")
  .setDescription("Display information about this server");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const guild = interaction.guild!;
  await guild.fetch();

  const owner = await guild.fetchOwner();
  const channels = guild.channels.cache;
  const textChannels = channels.filter((c) => c.isTextBased()).size;
  const voiceChannels = channels.filter((c) => c.isVoiceBased()).size;

  const embed = new EmbedBuilder()
    .setColor(Colors.info as number)
    .setTitle(guild.name)
    .setThumbnail(guild.iconURL())
    .addFields(
      { name: "Owner", value: owner.user.tag, inline: true },
      { name: "Members", value: guild.memberCount.toString(), inline: true },
      { name: "Roles", value: guild.roles.cache.size.toString(), inline: true },
      { name: "Text Channels", value: textChannels.toString(), inline: true },
      { name: "Voice Channels", value: voiceChannels.toString(), inline: true },
      { name: "Boost Level", value: `Tier ${guild.premiumTier}`, inline: true },
      { name: "Server ID", value: guild.id },
      { name: "Created", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>` },
    )
    .setFooter({ text: `Verification Level: ${guild.verificationLevel}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
