import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { checkModPermission } from "../../utils/permissions.js";
import { Colors, errorEmbed } from "../../utils/embeds.js";

export const data = new SlashCommandBuilder()
  .setName("timeoutinfo")
  .setDescription("Get timeout information for a specific user")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((opt) =>
    opt.setName("user").setDescription("The user to check").setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!await checkModPermission(interaction)) return;

  const target = interaction.options.getUser("user", true);
  const member = interaction.options.getMember("user") as GuildMember | null;

  if (!member?.isCommunicationDisabled()) {
    await interaction.reply({
      embeds: [errorEmbed("Not Timed Out", `**${target.tag}** is not currently timed out.`)],
      ephemeral: true,
    });
    return;
  }

  const expiry = member.communicationDisabledUntil!;
  const ts = Math.floor(expiry.getTime() / 1000);

  const embed = new EmbedBuilder()
    .setColor(Colors.timeout as number)
    .setTitle(`⏱️ Timeout Info: ${target.tag}`)
    .setThumbnail(target.displayAvatarURL())
    .addFields(
      { name: "User ID", value: target.id, inline: true },
      { name: "Status", value: "🔴 Active", inline: true },
      { name: "Expires", value: `<t:${ts}:F> (<t:${ts}:R>)` },
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
