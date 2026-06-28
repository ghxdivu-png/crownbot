import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { checkModPermission } from "../../utils/permissions.js";
import { checkCooldown } from "../../utils/cooldown.js";
import { successEmbed, errorEmbed } from "../../utils/embeds.js";
import { logModAction } from "../../utils/modlog.js";

export const data = new SlashCommandBuilder()
  .setName("untimeout")
  .setDescription("Remove a timeout from a member")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((opt) =>
    opt.setName("user").setDescription("The user to untimeout").setRequired(true)
  )
  .addStringOption((opt) =>
    opt.setName("reason").setDescription("Reason for removing the timeout").setRequired(false)
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

  if (!target.isCommunicationDisabled()) {
    await interaction.reply({ embeds: [errorEmbed("Not Timed Out", "This user is not currently timed out.")], ephemeral: true });
    return;
  }

  await target.timeout(null, reason);

  await interaction.reply({
    embeds: [successEmbed("Timeout Removed", `**${target.user.tag}**'s timeout has been removed.\n**Reason:** ${reason}`)],
  });

  await logModAction(interaction.guild!, {
    action: "untimeout",
    userId: target.id,
    guildId: interaction.guildId!,
    username: target.user.tag,
    moderatorId: interaction.user.id,
    moderatorTag: interaction.user.tag,
    reason,
  });
}
