import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { checkModPermission } from "../../utils/permissions.js";
import { checkCooldown } from "../../utils/cooldown.js";
import { successEmbed, errorEmbed } from "../../utils/embeds.js";
import { logModAction } from "../../utils/modlog.js";

export const data = new SlashCommandBuilder()
  .setName("unban")
  .setDescription("Unban a user from the server")
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addStringOption((opt) =>
    opt.setName("user_id").setDescription("The user ID to unban").setRequired(true)
  )
  .addStringOption((opt) =>
    opt.setName("reason").setDescription("Reason for the unban").setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!await checkCooldown(interaction)) return;
  if (!await checkModPermission(interaction)) return;

  const userId = interaction.options.getString("user_id", true);
  const reason = interaction.options.getString("reason") ?? "No reason provided";

  try {
    const ban = await interaction.guild!.bans.fetch(userId);
    await interaction.guild!.members.unban(userId, reason);

    await interaction.reply({
      embeds: [successEmbed("User Unbanned", `**${ban.user.tag}** has been unbanned.\n**Reason:** ${reason}`)],
    });

    await logModAction(interaction.guild!, {
      action: "unban",
      userId,
      guildId: interaction.guildId!,
      username: ban.user.tag,
      moderatorId: interaction.user.id,
      moderatorTag: interaction.user.tag,
      reason,
    });
  } catch {
    await interaction.reply({ embeds: [errorEmbed("Not Banned", "That user is not currently banned.")], ephemeral: true });
  }
}
