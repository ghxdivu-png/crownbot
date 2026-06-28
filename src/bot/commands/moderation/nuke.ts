import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel } from "discord.js";
import { checkModPermission } from "../../utils/permissions.js";
import { errorEmbed } from "../../utils/embeds.js";

export const data = new SlashCommandBuilder()
  .setName("nuke")
  .setDescription("⚠️ Delete and recreate this channel (clears ALL messages)")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addStringOption((opt) =>
    opt.setName("confirm").setDescription('Type "CONFIRM" to proceed').setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!await checkModPermission(interaction)) return;

  const confirm = interaction.options.getString("confirm", true);
  if (confirm !== "CONFIRM") {
    await interaction.reply({ embeds: [errorEmbed("Cancelled", 'You must type exactly `CONFIRM` to nuke this channel.')], ephemeral: true });
    return;
  }

  const channel = interaction.channel as TextChannel;
  if (!channel) { await interaction.reply({ content: "Channel not found.", ephemeral: true }); return; }

  await interaction.reply({ content: "💥 Nuking channel...", ephemeral: true });

  const cloned = await channel.clone({ reason: `Nuked by ${interaction.user.tag}` });
  await channel.delete(`Nuked by ${interaction.user.tag}`);

  await cloned.setPosition(channel.position);
  await cloned.send({ embeds: [{ color: 0xed4245, title: "💥 Channel Nuked", description: `This channel was nuked by **${interaction.user.tag}**.\nAll messages have been cleared.`, timestamp: new Date().toISOString() }] });
}
