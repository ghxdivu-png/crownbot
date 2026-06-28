import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, ChannelType } from "discord.js";
import { ScheduledMessage } from "../../database/models/ScheduledMessage.js";
import { successEmbed, errorEmbed } from "../../utils/embeds.js";
import { isDbConnected } from "../../database/connection.js";

function parseIntervalString(str: string): number | null {
  const match = str.match(/^(\d+)(m|h|d|w)$/i);
  if (!match) return null;
  const n = parseInt(match[1]!);
  const unit = match[2]!.toLowerCase();
  if (unit === "m") return n * 60_000;
  if (unit === "h") return n * 3_600_000;
  if (unit === "d") return n * 86_400_000;
  if (unit === "w") return n * 604_800_000;
  return null;
}

export const data = new SlashCommandBuilder()
  .setName("schedule")
  .setDescription("Manage scheduled messages")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(s => s
    .setName("create")
    .setDescription("Create a new scheduled message")
    .addStringOption(o => o.setName("label").setDescription("Name for this schedule").setRequired(true))
    .addChannelOption(o => o.setName("channel").setDescription("Channel to send to").addChannelTypes(ChannelType.GuildText).setRequired(true))
    .addStringOption(o => o.setName("interval").setDescription("Interval: 30m, 1h, 6h, 1d, 1w").setRequired(true))
    .addStringOption(o => o.setName("content").setDescription("Plain text content (optional)"))
    .addStringOption(o => o.setName("embed-title").setDescription("Embed title"))
    .addStringOption(o => o.setName("embed-description").setDescription("Embed description"))
    .addStringOption(o => o.setName("embed-color").setDescription("Embed hex color e.g. #5865F2"))
    .addStringOption(o => o.setName("embed-footer").setDescription("Embed footer text"))
    .addStringOption(o => o.setName("embed-image").setDescription("Embed image URL")))
  .addSubcommand(s => s.setName("list").setDescription("List all scheduled messages"))
  .addSubcommand(s => s.setName("pause").setDescription("Pause a schedule").addStringOption(o => o.setName("label").setDescription("Schedule label").setRequired(true)))
  .addSubcommand(s => s.setName("resume").setDescription("Resume a schedule").addStringOption(o => o.setName("label").setDescription("Schedule label").setRequired(true)))
  .addSubcommand(s => s.setName("delete").setDescription("Delete a schedule").addStringOption(o => o.setName("label").setDescription("Schedule label").setRequired(true)));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guild) return;
  if (!isDbConnected()) {
    await interaction.reply({ embeds: [errorEmbed("Database Error", "Database not connected.")], ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });
  const sub = interaction.options.getSubcommand();

  if (sub === "create") {
    const label = interaction.options.getString("label", true);
    const channel = interaction.options.getChannel("channel", true);
    const intervalStr = interaction.options.getString("interval", true);
    const intervalMs = parseIntervalString(intervalStr);
    if (!intervalMs) {
      await interaction.editReply({ embeds: [errorEmbed("Invalid Interval", "Use formats like: 30m, 1h, 6h, 1d, 1w")] });
      return;
    }

    const colorStr = interaction.options.getString("embed-color");
    let embedColor: number | undefined;
    if (colorStr) { const p = parseInt(colorStr.replace("#", ""), 16); if (!isNaN(p)) embedColor = p; }

    await ScheduledMessage.create({
      guildId: interaction.guild.id,
      channelId: channel.id,
      label,
      intervalMs,
      recurring: true,
      nextRunAt: new Date(Date.now() + intervalMs),
      createdBy: interaction.user.id,
      content: interaction.options.getString("content") ?? undefined,
      embedTitle: interaction.options.getString("embed-title") ?? undefined,
      embedDescription: interaction.options.getString("embed-description") ?? undefined,
      embedColor,
      embedFooter: interaction.options.getString("embed-footer") ?? undefined,
      embedImage: interaction.options.getString("embed-image") ?? undefined,
    });

    await interaction.editReply({ embeds: [successEmbed("Schedule Created", `**${label}** will run every **${intervalStr}** in <#${channel.id}>.`)] });
    return;
  }

  if (sub === "list") {
    const schedules = await ScheduledMessage.find({ guildId: interaction.guild.id });
    if (!schedules.length) {
      await interaction.editReply({ embeds: [errorEmbed("None Found", "No scheduled messages for this server.")] });
      return;
    }
    const lines = schedules.map(s => `• **${s.label}** → <#${s.channelId}> | ${s.paused ? "⏸ Paused" : "▶ Active"} | Runs: <t:${Math.floor(s.nextRunAt.getTime() / 1000)}:R>`);
    const embed = new EmbedBuilder().setTitle("📅 Scheduled Messages").setDescription(lines.join("\n")).setColor(0x5865F2).setFooter({ text: "Crown Bot 👑" }).setTimestamp();
    await interaction.editReply({ embeds: [embed] });
    return;
  }

  const label = interaction.options.getString("label", true);
  const schedule = await ScheduledMessage.findOne({ guildId: interaction.guild.id, label });
  if (!schedule) {
    await interaction.editReply({ embeds: [errorEmbed("Not Found", `No schedule named **${label}**.`)] });
    return;
  }

  if (sub === "pause") { schedule.paused = true; await schedule.save(); await interaction.editReply({ embeds: [successEmbed("Paused", `**${label}** is now paused.`)] }); }
  else if (sub === "resume") { schedule.paused = false; await schedule.save(); await interaction.editReply({ embeds: [successEmbed("Resumed", `**${label}** will resume.`)] }); }
  else if (sub === "delete") { await schedule.deleteOne(); await interaction.editReply({ embeds: [successEmbed("Deleted", `**${label}** has been removed.`)] }); }
}
