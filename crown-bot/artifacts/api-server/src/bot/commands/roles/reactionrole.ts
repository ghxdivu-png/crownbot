import {
  SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits,
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType,
} from "discord.js";
import { ReactionRolePanel } from "../../database/models/ReactionRole.js";
import { successEmbed, errorEmbed } from "../../utils/embeds.js";
import { isDbConnected } from "../../database/connection.js";

const STYLE_MAP: Record<string, ButtonStyle> = {
  primary: ButtonStyle.Primary,
  secondary: ButtonStyle.Secondary,
  success: ButtonStyle.Success,
  danger: ButtonStyle.Danger,
};

export const data = new SlashCommandBuilder()
  .setName("reactionrole")
  .setDescription("Manage reaction role panels")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .addSubcommand(s => s
    .setName("create")
    .setDescription("Create a new role panel")
    .addChannelOption(o => o.setName("channel").setDescription("Channel to post the panel").addChannelTypes(ChannelType.GuildText).setRequired(true))
    .addStringOption(o => o.setName("title").setDescription("Panel title").setRequired(true))
    .addStringOption(o => o.setName("description").setDescription("Panel description"))
    .addBooleanOption(o => o.setName("exclusive").setDescription("Users can only pick one role (default: false)")))
  .addSubcommand(s => s
    .setName("add-role")
    .setDescription("Add a role button to a panel")
    .addStringOption(o => o.setName("message-id").setDescription("Panel message ID").setRequired(true))
    .addRoleOption(o => o.setName("role").setDescription("Role to assign").setRequired(true))
    .addStringOption(o => o.setName("label").setDescription("Button label").setRequired(true))
    .addStringOption(o => o.setName("emoji").setDescription("Button emoji (optional)"))
    .addStringOption(o => o.setName("style").setDescription("Button style").addChoices(
      { name: "Blue (Primary)", value: "primary" },
      { name: "Grey (Secondary)", value: "secondary" },
      { name: "Green (Success)", value: "success" },
      { name: "Red (Danger)", value: "danger" },
    )))
  .addSubcommand(s => s
    .setName("delete")
    .setDescription("Delete a reaction role panel")
    .addStringOption(o => o.setName("message-id").setDescription("Panel message ID").setRequired(true)));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guild) return;
  if (!isDbConnected()) {
    await interaction.reply({ embeds: [errorEmbed("Database Error", "Database not connected.")], ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });
  const sub = interaction.options.getSubcommand();

  if (sub === "create") {
    const channel = interaction.options.getChannel("channel", true);
    const title = interaction.options.getString("title", true);
    const description = interaction.options.getString("description") ?? "Click a button below to add or remove a role!";
    const exclusive = interaction.options.getBoolean("exclusive") ?? false;

    const { TextChannel } = await import("discord.js");
    const ch = interaction.guild.channels.cache.get(channel.id) as typeof TextChannel.prototype | null;
    if (!ch) { await interaction.editReply({ embeds: [errorEmbed("Error", "Channel not found.")] }); return; }

    const embed = new EmbedBuilder()
      .setTitle(title).setDescription(description).setColor(0x5865F2)
      .setFooter({ text: "Crown Bot 👑 | Click a button to toggle your role" }).setTimestamp();

    const msg = await (ch as any).send({ embeds: [embed], components: [] });

    await ReactionRolePanel.create({
      guildId: interaction.guild.id, channelId: channel.id,
      messageId: msg.id, title, description, exclusive, entries: [],
    });

    await interaction.editReply({ embeds: [successEmbed("Panel Created", `Panel created! Message ID: \`${msg.id}\`\nUse \`/reactionrole add-role\` to add roles.`)] });
    return;
  }

  if (sub === "add-role") {
    const messageId = interaction.options.getString("message-id", true);
    const role = interaction.options.getRole("role", true);
    const label = interaction.options.getString("label", true);
    const emoji = interaction.options.getString("emoji") ?? undefined;
    const style = interaction.options.getString("style") ?? "primary";

    const panel = await ReactionRolePanel.findOne({ guildId: interaction.guild.id, messageId });
    if (!panel) { await interaction.editReply({ embeds: [errorEmbed("Not Found", "Panel not found with that message ID.")] }); return; }

    panel.entries.push({ roleId: role.id, label, emoji, style: style as any });
    await panel.save();

    // Rebuild buttons
    const channel = interaction.guild.channels.cache.get(panel.channelId);
    if (channel && "messages" in channel) {
      const msg = await (channel as any).messages.fetch(messageId).catch(() => null);
      if (msg) {
        const rows = buildButtonRows(panel.entries);
        await msg.edit({ components: rows });
      }
    }

    await interaction.editReply({ embeds: [successEmbed("Role Added", `Added **${role.name}** to the panel.`)] });
    return;
  }

  if (sub === "delete") {
    const messageId = interaction.options.getString("message-id", true);
    const panel = await ReactionRolePanel.findOne({ guildId: interaction.guild.id, messageId });
    if (!panel) { await interaction.editReply({ embeds: [errorEmbed("Not Found", "Panel not found.")] }); return; }
    await panel.deleteOne();
    const channel = interaction.guild.channels.cache.get(panel.channelId);
    if (channel && "messages" in channel) {
      const msg = await (channel as any).messages.fetch(messageId).catch(() => null);
      if (msg) await msg.delete().catch(() => {});
    }
    await interaction.editReply({ embeds: [successEmbed("Panel Deleted", "Reaction role panel removed.")] });
  }
}

export function buildButtonRows(entries: any[]): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let i = 0; i < entries.length; i += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const slice = entries.slice(i, i + 5);
    for (const entry of slice) {
      const btn = new ButtonBuilder()
        .setCustomId(`rr:${entry.roleId}`)
        .setLabel(entry.label)
        .setStyle(STYLE_MAP[entry.style?.toLowerCase() ?? "primary"] ?? ButtonStyle.Primary);
      if (entry.emoji) btn.setEmoji(entry.emoji);
      row.addComponents(btn);
    }
    rows.push(row);
  }
  return rows;
}
