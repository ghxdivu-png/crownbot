import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, ChannelType } from "discord.js";
import { getGuildConfig, GuildConfig } from "../../database/models/GuildConfig.js";
import { successEmbed, errorEmbed } from "../../utils/embeds.js";
import { isDbConnected } from "../../database/connection.js";

export const data = new SlashCommandBuilder()
  .setName("config")
  .setDescription("Configure Crown Bot settings")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(s => s.setName("view").setDescription("View current configuration"))
  .addSubcommand(s => s.setName("mod-log").setDescription("Set the moderation log channel")
    .addChannelOption(o => o.setName("channel").setDescription("Mod log channel").addChannelTypes(ChannelType.GuildText).setRequired(true)))
  .addSubcommand(s => s.setName("message-log").setDescription("Set the message log channel")
    .addChannelOption(o => o.setName("channel").setDescription("Message log channel").addChannelTypes(ChannelType.GuildText).setRequired(true)))
  .addSubcommand(s => s.setName("member-log").setDescription("Set the member log channel")
    .addChannelOption(o => o.setName("channel").setDescription("Member log channel").addChannelTypes(ChannelType.GuildText).setRequired(true)))
  .addSubcommand(s => s.setName("welcome-channel").setDescription("Set the welcome channel")
    .addChannelOption(o => o.setName("channel").setDescription("Welcome channel").addChannelTypes(ChannelType.GuildText).setRequired(true))
    .addStringOption(o => o.setName("message").setDescription("Welcome message. Use {user} {server} {count} as placeholders")))
  .addSubcommand(s => s.setName("goodbye-channel").setDescription("Set the goodbye channel")
    .addChannelOption(o => o.setName("channel").setDescription("Goodbye channel").addChannelTypes(ChannelType.GuildText).setRequired(true)))
  .addSubcommand(s => s.setName("auto-role").setDescription("Set automatic role on join")
    .addRoleOption(o => o.setName("role").setDescription("Role to assign").setRequired(true)))
  .addSubcommand(s => s.setName("suggestion-channel").setDescription("Set the suggestions channel")
    .addChannelOption(o => o.setName("channel").setDescription("Suggestions channel").addChannelTypes(ChannelType.GuildText).setRequired(true)))
  .addSubcommand(s => s.setName("ticket-log").setDescription("Set the ticket log channel")
    .addChannelOption(o => o.setName("channel").setDescription("Ticket log channel").addChannelTypes(ChannelType.GuildText).setRequired(true)))
  .addSubcommand(s => s.setName("automod-toggle").setDescription("Enable or disable automod")
    .addBooleanOption(o => o.setName("enabled").setDescription("Enable or disable automod").setRequired(true)))
  .addSubcommand(s => s.setName("automod-setting").setDescription("Configure an automod feature")
    .addStringOption(o => o.setName("feature").setDescription("Feature to toggle").setRequired(true).addChoices(
      { name: "Anti Spam", value: "antiSpam" }, { name: "Anti Flood", value: "antiFlood" },
      { name: "Anti Invite", value: "antiInvite" }, { name: "Anti Links", value: "antiLinks" },
      { name: "Anti Mention Spam", value: "antiMentionSpam" }, { name: "Anti Caps", value: "antiCaps" },
      { name: "Anti Duplicate", value: "antiDuplicate" },
    ))
    .addBooleanOption(o => o.setName("enabled").setDescription("Enable or disable this feature").setRequired(true)))
  .addSubcommand(s => s.setName("blocked-word").setDescription("Add or remove a blocked word")
    .addStringOption(o => o.setName("action").setDescription("Add or remove").setRequired(true).addChoices({ name: "Add", value: "add" }, { name: "Remove", value: "remove" }))
    .addStringOption(o => o.setName("word").setDescription("The word").setRequired(true)));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guild) return;
  if (!isDbConnected()) {
    await interaction.reply({ embeds: [errorEmbed("Database Error", "Database not connected. Set MONGODB_URI.")], ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });
  const sub = interaction.options.getSubcommand();
  const config = await getGuildConfig(interaction.guild.id);

  if (sub === "view") {
    const embed = new EmbedBuilder()
      .setTitle("⚙️ Crown Bot Configuration")
      .setColor(0x5865F2)
      .addFields(
        { name: "Mod Log", value: config.modLogChannel ? `<#${config.modLogChannel}>` : "Not set", inline: true },
        { name: "Message Log", value: config.messageLogChannel ? `<#${config.messageLogChannel}>` : "Not set", inline: true },
        { name: "Member Log", value: config.memberLogChannel ? `<#${config.memberLogChannel}>` : "Not set", inline: true },
        { name: "Welcome", value: config.welcomeChannel ? `<#${config.welcomeChannel}>` : "Not set", inline: true },
        { name: "Goodbye", value: config.goodbyeChannel ? `<#${config.goodbyeChannel}>` : "Not set", inline: true },
        { name: "Auto Role", value: config.autoRole ? `<@&${config.autoRole}>` : "Not set", inline: true },
        { name: "Suggestions", value: config.suggestionChannel ? `<#${config.suggestionChannel}>` : "Not set", inline: true },
        { name: "Ticket Log", value: config.ticketLogChannel ? `<#${config.ticketLogChannel}>` : "Not set", inline: true },
        { name: "Automod", value: config.automod.enabled ? "✅ Enabled" : "❌ Disabled", inline: true },
        { name: "Blocked Words", value: `${config.automod.blockedWords.length} words`, inline: true },
        { name: "Leveling", value: config.features.leveling ? "✅ On" : "❌ Off", inline: true },
      )
      .setFooter({ text: "Crown Bot 👑" }).setTimestamp();
    await interaction.editReply({ embeds: [embed] });
    return;
  }

  const updates: any = {};

  if (sub === "mod-log") updates.modLogChannel = interaction.options.getChannel("channel", true).id;
  else if (sub === "message-log") updates.messageLogChannel = interaction.options.getChannel("channel", true).id;
  else if (sub === "member-log") updates.memberLogChannel = interaction.options.getChannel("channel", true).id;
  else if (sub === "welcome-channel") {
    updates.welcomeChannel = interaction.options.getChannel("channel", true).id;
    const msg = interaction.options.getString("message");
    if (msg) updates.welcomeMessage = msg;
  }
  else if (sub === "goodbye-channel") updates.goodbyeChannel = interaction.options.getChannel("channel", true).id;
  else if (sub === "auto-role") updates.autoRole = interaction.options.getRole("role", true).id;
  else if (sub === "suggestion-channel") updates.suggestionChannel = interaction.options.getChannel("channel", true).id;
  else if (sub === "ticket-log") updates.ticketLogChannel = interaction.options.getChannel("channel", true).id;
  else if (sub === "automod-toggle") updates["automod.enabled"] = interaction.options.getBoolean("enabled", true);
  else if (sub === "automod-setting") {
    const feature = interaction.options.getString("feature", true);
    const enabled = interaction.options.getBoolean("enabled", true);
    updates[`automod.${feature}`] = enabled;
  }
  else if (sub === "blocked-word") {
    const action = interaction.options.getString("action", true);
    const word = interaction.options.getString("word", true).toLowerCase();
    if (action === "add") {
      if (!config.automod.blockedWords.includes(word)) {
        await GuildConfig.updateOne({ guildId: interaction.guild.id }, { $push: { "automod.blockedWords": word } });
        await interaction.editReply({ embeds: [successEmbed("Word Added", `\`${word}\` added to blocked words.`)] });
        return;
      }
    } else {
      await GuildConfig.updateOne({ guildId: interaction.guild.id }, { $pull: { "automod.blockedWords": word } });
      await interaction.editReply({ embeds: [successEmbed("Word Removed", `\`${word}\` removed from blocked words.`)] });
      return;
    }
  }

  if (Object.keys(updates).length > 0) {
    await GuildConfig.updateOne({ guildId: interaction.guild.id }, { $set: updates });
  }

  await interaction.editReply({ embeds: [successEmbed("Config Updated", `Setting \`${sub}\` has been updated.`)] });
}
