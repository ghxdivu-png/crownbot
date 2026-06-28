import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { getSniped } from "../../utils/snipeStore.js";

export const data = new SlashCommandBuilder()
  .setName("snipe")
  .setDescription("Show the last deleted message in this channel")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const sniped = getSniped(interaction.channelId);

  if (!sniped) {
    await interaction.reply({ content: "🔍 No recently deleted messages found in this channel.", ephemeral: true });
    return;
  }

  const ts = Math.floor(sniped.deletedAt.getTime() / 1000);

  const embed = new EmbedBuilder()
    .setColor(0x99aab5)
    .setTitle("🔫 Sniped Message")
    .setDescription(sniped.content)
    .setAuthor({ name: sniped.authorTag, iconURL: sniped.authorAvatar ?? undefined })
    .setFooter({ text: `Deleted` })
    .setTimestamp(sniped.deletedAt);

  await interaction.reply({ embeds: [embed] });
}
