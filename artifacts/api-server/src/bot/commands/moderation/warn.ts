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
  .setName("warn")
  .setDescription("Warn a member")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((opt) =>
    opt.setName("user").setDescription("The user to warn").setRequired(true)
  )
  .addStringOption((opt) =>
    opt.setName("reason").setDescription("Reason for the warning").setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!await checkCooldown(interaction)) return;
  if (!await checkModPermission(interaction)) return;

  const target = interaction.options.getMember("user") as GuildMember | null;
  const reason = interaction.options.getString("reason", true);

  if (!target) {
    await interaction.reply({ embeds: [errorEmbed("User Not Found", "That user is not in this server.")], ephemeral: true });
    return;
  }

  if (!await checkTargetVulnerable(interaction, target)) return;

  await interaction.reply({
    embeds: [successEmbed("Warning Issued", `**${target.user.tag}** has been warned.\n**Reason:** ${reason}`)],
  });

  // Try to DM the user
  try {
    await target.send({ embeds: [{ color: 0xfee75c, title: "⚠️ You have been warned", description: `**Server:** ${interaction.guild!.name}\n**Reason:** ${reason}` }] });
  } catch { /* DMs may be disabled */ }

  await logModAction(interaction.guild!, {
    action: "warn",
    userId: target.id,
    guildId: interaction.guildId!,
    username: target.user.tag,
    moderatorId: interaction.user.id,
    moderatorTag: interaction.user.tag,
    reason,
  });
}
