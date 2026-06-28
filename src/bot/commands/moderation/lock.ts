import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
  OverwriteType,
} from "discord.js";
import { checkModPermission } from "../../utils/permissions.js";
import { successEmbed, errorEmbed } from "../../utils/embeds.js";
import { logModAction } from "../../utils/modlog.js";

export const data = new SlashCommandBuilder()
  .setName("lock")
  .setDescription("Lock a channel so members cannot send messages")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addStringOption((opt) =>
    opt.setName("reason").setDescription("Reason for locking").setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!await checkModPermission(interaction)) return;

  const channel = interaction.channel as TextChannel;
  const reason = interaction.options.getString("reason") ?? "No reason provided";
  const everyone = interaction.guild!.roles.everyone;

  const currentPerms = channel.permissionsFor(everyone);
  if (currentPerms?.has(PermissionFlagsBits.SendMessages) === false) {
    await interaction.reply({ embeds: [errorEmbed("Already Locked", "This channel is already locked.")], ephemeral: true });
    return;
  }

  await channel.permissionOverwrites.edit(everyone, { SendMessages: false }, { reason });

  await interaction.reply({
    embeds: [successEmbed("Channel Locked", `🔒 This channel has been locked.\n**Reason:** ${reason}`)],
  });

  await logModAction(interaction.guild!, {
    action: "lock",
    userId: interaction.user.id,
    guildId: interaction.guildId!,
    username: `#${channel.name}`,
    moderatorId: interaction.user.id,
    moderatorTag: interaction.user.tag,
    reason,
  });
}
