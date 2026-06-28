import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { Suggestion, SuggestionStatus } from "../../database/models/Suggestion.js";
import { successEmbed, errorEmbed } from "../../utils/embeds.js";
import { isDbConnected } from "../../database/connection.js";

const STATUS_COLORS: Record<SuggestionStatus, number> = {
  pending: 0x5865F2, approved: 0x57F287, rejected: 0xED4245, considering: 0xFEE75C,
};
const STATUS_LABELS: Record<SuggestionStatus, string> = {
  pending: "⏳ Pending", approved: "✅ Approved", rejected: "❌ Rejected", considering: "🤔 Considering",
};

export const data = new SlashCommandBuilder()
  .setName("suggestion")
  .setDescription("Manage suggestions")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addSubcommand(s => s.setName("approve").setDescription("Approve a suggestion")
    .addStringOption(o => o.setName("message-id").setDescription("Suggestion message ID").setRequired(true))
    .addStringOption(o => o.setName("note").setDescription("Optional review note")))
  .addSubcommand(s => s.setName("reject").setDescription("Reject a suggestion")
    .addStringOption(o => o.setName("message-id").setDescription("Suggestion message ID").setRequired(true))
    .addStringOption(o => o.setName("note").setDescription("Reason for rejection")))
  .addSubcommand(s => s.setName("consider").setDescription("Mark a suggestion as being considered")
    .addStringOption(o => o.setName("message-id").setDescription("Suggestion message ID").setRequired(true))
    .addStringOption(o => o.setName("note").setDescription("Optional note")));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guild) return;
  if (!isDbConnected()) {
    await interaction.reply({ embeds: [errorEmbed("Database Error", "Database not connected.")], ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });
  const sub = interaction.options.getSubcommand() as "approve" | "reject" | "consider";
  const messageId = interaction.options.getString("message-id", true);
  const note = interaction.options.getString("note") ?? undefined;

  const suggestion = await Suggestion.findOne({ guildId: interaction.guild.id, messageId });
  if (!suggestion) {
    await interaction.editReply({ embeds: [errorEmbed("Not Found", "Suggestion not found.")] });
    return;
  }

  const newStatus: SuggestionStatus = sub === "approve" ? "approved" : sub === "reject" ? "rejected" : "considering";
  suggestion.status = newStatus;
  suggestion.reviewedBy = interaction.user.id;
  suggestion.reviewNote = note;
  await suggestion.save();

  // Update original message embed
  const channel = interaction.guild.channels.cache.get(suggestion.channelId);
  if (channel && "messages" in channel) {
    const msg = await (channel as any).messages.fetch(messageId).catch(() => null);
    if (msg) {
      const oldEmbed = msg.embeds[0];
      const embed = new EmbedBuilder(oldEmbed?.data)
        .setColor(STATUS_COLORS[newStatus])
        .spliceFields(1, 1, { name: "Status", value: STATUS_LABELS[newStatus], inline: true });
      if (note) embed.addFields({ name: "Review Note", value: note, inline: false });
      await msg.edit({ embeds: [embed] }).catch(() => {});
    }
  }

  await interaction.editReply({ embeds: [successEmbed("Suggestion Updated", `Marked as **${newStatus}**.`)] });
}
