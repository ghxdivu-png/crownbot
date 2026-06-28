import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { checkModPermission, checkTargetVulnerable } from "../../utils/permissions.js";
import { checkCooldown } from "../../utils/cooldown.js";
import { successEmbed, errorEmbed } from "../../utils/embeds.js";
import { logModAction } from "../../utils/modlog.js";

export const data = new SlashCommandBuilder()
  .setName("ban")
  .setDescription("Ban a member from the server")
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addUserOption((opt) =>
    opt.setName("user").setDescription("The user to ban").setRequired(true)
  )
  .addStringOption((opt) =>
    opt.setName("reason").setDescription("Reason for the ban").setRequired(false)
  )
  .addIntegerOption((opt) =>
    opt.setName("delete_days").setDescription("Days of messages to delete (0-7)").setRequired(false).setMinValue(0).setMaxValue(7)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!await checkCooldown(interaction)) return;
  if (!await checkModPermission(interaction)) return;

  const target = interaction.options.getMember("user") as GuildMember | null;
  const reason = interaction.options.getString("reason") ?? "No reason provided";
  const deleteDays = interaction.options.getInteger("delete_days") ?? 0;

  if (!target) {
    await interaction.reply({ embeds: [errorEmbed("User Not Found", "That user is not in this server.")], ephemeral: true });
    return;
  }

  if (!await checkTargetVulnerable(interaction, target)) return;

  if (!target.bannable) {
    await interaction.reply({ embeds: [errorEmbed("Cannot Ban", "I do not have permission to ban this user.")], ephemeral: true });
    return;
  }

  await target.ban({ reason, deleteMessageDays: deleteDays });

  await interaction.reply({
    embeds: [successEmbed("User Banned", `**${target.user.tag}** has been banned.\n**Reason:** ${reason}`)],
  });

  await logModAction(interaction.guild!, {
    action: "ban",
    userId: target.id,
    guildId: interaction.guildId!,
    username: target.user.tag,
    moderatorId: interaction.user.id,
    moderatorTag: interaction.user.tag,
    reason,
  });
}
