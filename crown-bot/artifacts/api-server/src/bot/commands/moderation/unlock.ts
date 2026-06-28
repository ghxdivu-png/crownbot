import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { checkModPermission } from "../../utils/permissions.js";
import { successEmbed, errorEmbed } from "../../utils/embeds.js";
import { logModAction } from "../../utils/modlog.js";

export const data = new SlashCommandBuilder()
  .setName("unlock")
  .setDescription("Unlock a channel to allow members to send messages again")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addStringOption((opt) =>
    opt.setName("reason").setDescription("Reason for unlocking").setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!await checkModPermission(interaction)) return;

  const channel = interaction.channel as TextChannel;
  const reason = interaction.options.getString("reason") ?? "No reason provided";
  const everyone = interaction.guild!.roles.everyone;

  await channel.permissionOverwrites.edit(everyone, { SendMessages: null }, { reason });

  await interaction.reply({
    embeds: [successEmbed("Channel Unlocked", `🔓 This channel has been unlocked.\n**Reason:** ${reason}`)],
  });

  await logModAction(interaction.guild!, {
    action: "unlock",
    userId: interaction.user.id,
    guildId: interaction.guildId!,
    username: `#${channel.name}`,
    moderatorId: interaction.user.id,
    moderatorTag: interaction.user.tag,
    reason,
  });
}
