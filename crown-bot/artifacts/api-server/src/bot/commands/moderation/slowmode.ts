import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { checkModPermission } from "../../utils/permissions.js";
import { successEmbed } from "../../utils/embeds.js";
import { logModAction } from "../../utils/modlog.js";

export const data = new SlashCommandBuilder()
  .setName("slowmode")
  .setDescription("Set the slowmode delay for a channel")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addIntegerOption((opt) =>
    opt.setName("seconds").setDescription("Slowmode delay in seconds (0 to disable, max 21600)").setRequired(true).setMinValue(0).setMaxValue(21600)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!await checkModPermission(interaction)) return;

  const seconds = interaction.options.getInteger("seconds", true);
  const channel = interaction.channel as TextChannel;

  await channel.setRateLimitPerUser(seconds);

  const msg = seconds === 0
    ? "Slowmode has been **disabled** for this channel."
    : `Slowmode set to **${seconds} second(s)** for this channel.`;

  await interaction.reply({ embeds: [successEmbed("Slowmode Updated", msg)] });

  await logModAction(interaction.guild!, {
    action: "slowmode",
    userId: interaction.user.id,
    guildId: interaction.guildId!,
    username: `#${channel.name}`,
    moderatorId: interaction.user.id,
    moderatorTag: interaction.user.tag,
    reason: `Slowmode set to ${seconds}s`,
  });
}
