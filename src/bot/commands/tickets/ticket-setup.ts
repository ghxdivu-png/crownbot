import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, ChannelType } from "discord.js";
import { TicketService } from "../../services/TicketService.js";
import { successEmbed, errorEmbed } from "../../utils/embeds.js";
import { isDbConnected } from "../../database/connection.js";

export const data = new SlashCommandBuilder()
  .setName("ticket-setup")
  .setDescription("Create a ticket panel in a channel")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addChannelOption(o => o.setName("channel").setDescription("Channel for the ticket panel").addChannelTypes(ChannelType.GuildText).setRequired(true))
  .addStringOption(o => o.setName("title").setDescription("Panel title").setRequired(true))
  .addStringOption(o => o.setName("description").setDescription("Panel description").setRequired(true))
  .addChannelOption(o => o.setName("category").setDescription("Category for ticket channels").addChannelTypes(ChannelType.GuildCategory))
  .addRoleOption(o => o.setName("support-role").setDescription("Support role that can see tickets"))
  .addStringOption(o => o.setName("color").setDescription("Embed color (hex, e.g. #5865F2)"));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guild) return;
  if (!isDbConnected()) {
    await interaction.reply({ embeds: [errorEmbed("Database Error", "Database is not connected. Set MONGODB_URI.")], ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const channel = interaction.options.getChannel("channel", true);
  const title = interaction.options.getString("title", true);
  const description = interaction.options.getString("description", true);
  const category = interaction.options.getChannel("category");
  const supportRole = interaction.options.getRole("support-role");
  const colorStr = interaction.options.getString("color");

  let color: number | undefined;
  if (colorStr) {
    const hex = colorStr.replace("#", "");
    const parsed = parseInt(hex, 16);
    if (!isNaN(parsed)) color = parsed;
  }

  const result = await TicketService.createPanel(interaction.guild, channel.id, {
    title, description, color,
    categoryId: category?.id,
    supportRoles: supportRole ? [supportRole.id] : [],
  });

  if (!result.ok) {
    await interaction.editReply({ embeds: [errorEmbed("Setup Failed", result.error ?? "Unknown error")] });
    return;
  }

  await interaction.editReply({ embeds: [successEmbed("Ticket Panel Created", `Panel created in <#${channel.id}>! Users can click the button to open a ticket.`)] });
}
