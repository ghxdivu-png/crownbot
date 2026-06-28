import {
  SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits,
} from "discord.js";
import { Suggestion } from "../../database/models/Suggestion.js";
import { getGuildConfig } from "../../database/models/GuildConfig.js";
import { errorEmbed } from "../../utils/embeds.js";
import { isDbConnected } from "../../database/connection.js";

export const data = new SlashCommandBuilder()
  .setName("suggest")
  .setDescription("Submit a suggestion for the server")
  .addStringOption(o => o.setName("suggestion").setDescription("Your suggestion (max 1000 chars)").setRequired(true).setMaxLength(1000))
  .addBooleanOption(o => o.setName("anonymous").setDescription("Submit anonymously? (default: false)"));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guild) return;
  if (!isDbConnected()) {
    await interaction.reply({ embeds: [errorEmbed("Database Error", "Database not connected.")], ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const config = await getGuildConfig(interaction.guild.id);
  if (!config.suggestionChannel) {
    await interaction.editReply({ embeds: [errorEmbed("Not Configured", "No suggestion channel set. Ask an admin to use `/config suggestion-channel`.")] });
    return;
  }

  const content = interaction.options.getString("suggestion", true);
  const anonymous = interaction.options.getBoolean("anonymous") ?? false;

  const channel = interaction.guild.channels.cache.get(config.suggestionChannel);
  if (!channel || !("send" in channel)) {
    await interaction.editReply({ embeds: [errorEmbed("Error", "Suggestion channel not found.")] });
    return;
  }

  const authorField = anonymous ? "Anonymous 🎭" : `${interaction.user.tag}`;

  const embed = new EmbedBuilder()
    .setTitle("💡 New Suggestion")
    .setDescription(content)
    .setColor(0x5865F2)
    .addFields(
      { name: "Submitted By", value: authorField, inline: true },
      { name: "Status", value: "⏳ Pending", inline: true },
      { name: "Votes", value: "👍 0 | 👎 0", inline: true },
    )
    .setFooter({ text: "Crown Bot 👑 | Vote with the buttons below" })
    .setTimestamp();

  if (!anonymous) embed.setThumbnail(interaction.user.displayAvatarURL());

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("sug:up").setLabel("👍 Upvote").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("sug:down").setLabel("👎 Downvote").setStyle(ButtonStyle.Danger),
  );

  const msg = await (channel as any).send({ embeds: [embed], components: [row] });

  await Suggestion.create({
    guildId: interaction.guild.id,
    channelId: config.suggestionChannel,
    messageId: msg.id,
    userId: interaction.user.id,
    anonymous,
    content,
    status: "pending",
  });

  await interaction.editReply({ embeds: [new EmbedBuilder().setDescription("✅ Your suggestion has been submitted!").setColor(0x57F287)] });
}
