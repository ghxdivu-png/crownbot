import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import { checkModPermission } from "../../utils/permissions.js";
import { successEmbed, errorEmbed } from "../../utils/embeds.js";
import { logModAction } from "../../utils/modlog.js";

export const data = new SlashCommandBuilder()
  .setName("hackban")
  .setDescription("Ban a user by ID even if they're not in the server")
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addStringOption((opt) => opt.setName("userid").setDescription("User ID to ban").setRequired(true))
  .addStringOption((opt) => opt.setName("reason").setDescription("Reason").setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!await checkModPermission(interaction)) return;

  const userId = interaction.options.getString("userid", true).trim();
  const reason = interaction.options.getString("reason") ?? "No reason provided";

  if (!/^\d{17,20}$/.test(userId)) {
    await interaction.reply({ embeds: [errorEmbed("Invalid ID", "Please provide a valid Discord user ID (17-20 digits).")], ephemeral: true });
    return;
  }

  try {
    await interaction.guild!.members.ban(userId, { reason: `Hackban: ${reason}` });
    let tag = userId;
    try { const user = await interaction.client.users.fetch(userId); tag = user.tag; } catch { /* user not fetchable */ }

    await interaction.reply({ embeds: [successEmbed("User Hackbanned", `**${tag}** has been banned by ID.\n**Reason:** ${reason}`)] });
    await logModAction(interaction.guild!, { action: "hackban", userId, guildId: interaction.guildId!, moderatorId: interaction.user.id, moderatorTag: interaction.user.tag, reason });
  } catch {
    await interaction.reply({ embeds: [errorEmbed("Ban Failed", "Could not ban that user. They may already be banned or the ID is invalid.")], ephemeral: true });
  }
}
