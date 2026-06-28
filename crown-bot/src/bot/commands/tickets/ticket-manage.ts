import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, GuildMember } from "discord.js";
import { TicketService } from "../../services/TicketService.js";
import { Ticket } from "../../database/models/Ticket.js";
import { successEmbed, errorEmbed } from "../../utils/embeds.js";
import { isDbConnected } from "../../database/connection.js";

export const data = new SlashCommandBuilder()
  .setName("ticket")
  .setDescription("Manage tickets")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addSubcommand(s => s.setName("close").setDescription("Close the current ticket").addStringOption(o => o.setName("reason").setDescription("Reason for closing")))
  .addSubcommand(s => s.setName("claim").setDescription("Claim this ticket"))
  .addSubcommand(s => s.setName("transcript").setDescription("Generate a transcript of this ticket"))
  .addSubcommand(s => s.setName("stats").setDescription("Show ticket statistics for this server"));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guild) return;
  if (!isDbConnected()) {
    await interaction.reply({ embeds: [errorEmbed("Database Error", "Database not connected.")], ephemeral: true });
    return;
  }

  const sub = interaction.options.getSubcommand();
  const member = interaction.member as GuildMember;

  await interaction.deferReply({ ephemeral: sub !== "transcript" });

  if (sub === "close") {
    const reason = interaction.options.getString("reason") ?? undefined;
    const result = await TicketService.closeTicket(interaction.guild, interaction.channelId, member, reason);
    if (!result.ok) {
      await interaction.editReply({ embeds: [errorEmbed("Cannot Close", result.error ?? "This is not a ticket channel.")] });
      return;
    }
    await interaction.editReply({ embeds: [successEmbed("Ticket Closing", "Ticket will be deleted in 10 seconds.")] });
    return;
  }

  if (sub === "claim") {
    const result = await TicketService.claimTicket(interaction.guild, interaction.channelId, member);
    if (!result.ok) {
      await interaction.editReply({ embeds: [errorEmbed("Cannot Claim", result.error ?? "This is not a ticket channel.")] });
      return;
    }
    await interaction.editReply({ embeds: [successEmbed("Ticket Claimed", "You have claimed this ticket.")] });
    return;
  }

  if (sub === "transcript") {
    const ticket = await Ticket.findOne({ guildId: interaction.guild.id, channelId: interaction.channelId });
    if (!ticket) {
      await interaction.editReply({ embeds: [errorEmbed("Not a Ticket", "This command must be used inside a ticket channel.")] });
      return;
    }
    const { TextChannel } = await import("discord.js");
    const channel = interaction.channel;
    if (!channel || !(channel instanceof TextChannel)) {
      await interaction.editReply({ embeds: [errorEmbed("Error", "Cannot generate transcript here.")] });
      return;
    }
    const transcript = await TicketService.generateTranscript(channel, ticket.ticketNumber);
    const buf = Buffer.from(transcript, "utf8");
    await interaction.editReply({
      embeds: [successEmbed("Transcript Generated", `Ticket #${ticket.ticketNumber} transcript attached below.`)],
      files: [{ attachment: buf, name: `ticket-${ticket.ticketNumber}-transcript.txt` }],
    });
    return;
  }

  if (sub === "stats") {
    const [total, open, closed] = await Promise.all([
      Ticket.countDocuments({ guildId: interaction.guild.id }),
      Ticket.countDocuments({ guildId: interaction.guild.id, status: { $in: ["open", "claimed"] } }),
      Ticket.countDocuments({ guildId: interaction.guild.id, status: "closed" }),
    ]);
    const { EmbedBuilder } = await import("discord.js");
    const embed = new EmbedBuilder()
      .setTitle("🎫 Ticket Statistics")
      .addFields(
        { name: "Total Tickets", value: `${total}`, inline: true },
        { name: "Open", value: `${open}`, inline: true },
        { name: "Closed", value: `${closed}`, inline: true },
      )
      .setColor(0x5865F2)
      .setFooter({ text: "Crown Bot 👑" })
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  }
}
