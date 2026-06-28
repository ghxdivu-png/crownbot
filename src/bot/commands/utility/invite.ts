import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, OAuth2Scopes, PermissionFlagsBits as PF } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("invite")
  .setDescription("Get a link to invite this bot to your server");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const link = interaction.client.generateInvite({
    scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
    permissions: [
      PF.BanMembers, PF.KickMembers, PF.ModerateMembers, PF.ManageMessages,
      PF.ManageChannels, PF.ReadMessageHistory, PF.SendMessages, PF.EmbedLinks,
      PF.AttachFiles, PF.AddReactions, PF.ViewChannel,
    ],
  });

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("📨 Invite Me!")
    .setDescription(`Click the link below to add me to your server:\n\n[**Invite ${interaction.client.user?.username}**](${link})`)
    .setThumbnail(interaction.client.user?.displayAvatarURL() ?? null)
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
