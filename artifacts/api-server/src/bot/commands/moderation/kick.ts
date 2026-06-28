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
  .setName("kick")
  .setDescription("Kick a member from the server")
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .addUserOption((opt) =>
    opt.setName("user").setDescription("The user to kick").setRequired(true)
  )
  .addStringOption((opt) =>
    opt.setName("reason").setDescription("Reason for the kick").setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!await checkCooldown(interaction)) return;
  if (!await checkModPermission(interaction)) return;

  const target = interaction.options.getMember("user") as GuildMember | null;
  const reason = interaction.options.getString("reason") ?? "No reason provided";

  if (!target) {
    await interaction.reply({ embeds: [errorEmbed("User Not Found", "That user is not in this server.")], ephemeral: true });
    return;
  }

  if (!await checkTargetVulnerable(interaction, target)) return;

  if (!target.kickable) {
    await interaction.reply({ embeds: [errorEmbed("Cannot Kick", "I do not have permission to kick this user.")], ephemeral: true });
    return;
  }

  await target.kick(reason);

  await interaction.reply({
    embeds: [successEmbed("User Kicked", `**${target.user.tag}** has been kicked.\n**Reason:** ${reason}`)],
  });

  await logModAction(interaction.guild!, {
    action: "kick",
    userId: target.id,
    guildId: interaction.guildId!,
    username: target.user.tag,
    moderatorId: interaction.user.id,
    moderatorTag: interaction.user.tag,
    reason,
  });
}
