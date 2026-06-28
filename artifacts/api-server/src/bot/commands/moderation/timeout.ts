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

const DURATION_CHOICES = [
  { name: "1 minute",   value: "60" },
  { name: "5 minutes",  value: "300" },
  { name: "10 minutes", value: "600" },
  { name: "30 minutes", value: "1800" },
  { name: "1 hour",     value: "3600" },
  { name: "6 hours",    value: "21600" },
  { name: "12 hours",   value: "43200" },
  { name: "1 day",      value: "86400" },
  { name: "3 days",     value: "259200" },
  { name: "1 week",     value: "604800" },
] as const;

const DURATION_MAP: Record<string, number> = Object.fromEntries(
  DURATION_CHOICES.map(({ value }) => [value, Number(value) * 1000])
);

export const data = new SlashCommandBuilder()
  .setName("timeout")
  .setDescription("Timeout a member")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((opt) =>
    opt.setName("user").setDescription("The user to timeout").setRequired(true)
  )
  .addStringOption((opt) =>
    opt.setName("duration")
      .setDescription("Timeout duration")
      .setRequired(true)
      .addChoices(...DURATION_CHOICES)
  )
  .addStringOption((opt) =>
    opt.setName("reason").setDescription("Reason for the timeout").setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!await checkCooldown(interaction)) return;
  if (!await checkModPermission(interaction)) return;

  const target = interaction.options.getMember("user") as GuildMember | null;
  const durationKey = interaction.options.getString("duration", true);
  const reason = interaction.options.getString("reason") ?? "No reason provided";

  if (!target) {
    await interaction.reply({ embeds: [errorEmbed("User Not Found", "That user is not in this server.")], ephemeral: true });
    return;
  }

  if (!await checkTargetVulnerable(interaction, target)) return;

  const durationMs = DURATION_MAP[durationKey];
  if (!durationMs) {
    await interaction.reply({ embeds: [errorEmbed("Invalid Duration", "Please select a valid duration.")], ephemeral: true });
    return;
  }

  const labelName = DURATION_CHOICES.find((c) => c.value === durationKey)?.name ?? `${durationKey}s`;

  await target.timeout(durationMs, reason);

  await interaction.reply({
    embeds: [successEmbed("User Timed Out", `**${target.user.tag}** has been timed out for **${labelName}**.\n**Reason:** ${reason}`)],
  });

  await logModAction(interaction.guild!, {
    action: "timeout",
    userId: target.id,
    guildId: interaction.guildId!,
    username: target.user.tag,
    moderatorId: interaction.user.id,
    moderatorTag: interaction.user.tag,
    reason,
    duration: labelName,
  });
}
