import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, PermissionFlagsBits } from "discord.js";
import { checkModPermission, checkTargetVulnerable } from "../../utils/permissions.js";
import { checkCooldown } from "../../utils/cooldown.js";
import { successEmbed, errorEmbed } from "../../utils/embeds.js";
import { logModAction } from "../../utils/modlog.js";

export const data = new SlashCommandBuilder()
  .setName("softban")
  .setDescription("Softban a member (ban then immediately unban to purge messages)")
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addUserOption((opt) => opt.setName("user").setDescription("The user to softban").setRequired(true))
  .addStringOption((opt) => opt.setName("reason").setDescription("Reason").setRequired(false))
  .addIntegerOption((opt) =>
    opt.setName("delete_days").setDescription("Days of messages to delete (1-7, default 1)").setMinValue(1).setMaxValue(7)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!await checkCooldown(interaction)) return;
  if (!await checkModPermission(interaction)) return;

  const target = interaction.options.getMember("user") as GuildMember | null;
  const reason = interaction.options.getString("reason") ?? "No reason provided";
  const deleteDays = interaction.options.getInteger("delete_days") ?? 1;

  if (!target) { await interaction.reply({ embeds: [errorEmbed("User Not Found", "That user is not in this server.")], ephemeral: true }); return; }
  if (!await checkTargetVulnerable(interaction, target)) return;
  if (!target.bannable) { await interaction.reply({ embeds: [errorEmbed("Cannot Ban", "I don't have permission to ban this user.")], ephemeral: true }); return; }

  await target.ban({ reason: `Softban: ${reason}`, deleteMessageDays: deleteDays });
  await interaction.guild!.members.unban(target.id, "Softban unban");

  await interaction.reply({ embeds: [successEmbed("User Softbanned", `**${target.user.tag}** was softbanned (messages deleted, then unbanned).\n**Reason:** ${reason}`)] });
  await logModAction(interaction.guild!, { action: "softban", userId: target.id, guildId: interaction.guildId!, username: target.user.tag, moderatorId: interaction.user.id, moderatorTag: interaction.user.tag, reason });
}
