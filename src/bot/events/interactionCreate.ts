import {
  Interaction, Events, ChatInputCommandInteraction,
  ButtonInteraction, GuildMember, EmbedBuilder, TextChannel,
} from "discord.js";
import { logger } from "../../lib/logger.js";
import { errorEmbed } from "../utils/embeds.js";
import { TicketService } from "../services/TicketService.js";
import { TicketPanel } from "../database/models/Ticket.js";
import { ReactionRolePanel } from "../database/models/ReactionRole.js";
import { Suggestion } from "../database/models/Suggestion.js";
import { isDbConnected } from "../database/connection.js";

export const name = Events.InteractionCreate;
export const once = false;

export async function execute(interaction: Interaction): Promise<void> {
  // ── Slash commands ──────────────────────────────────────────────────────────
  if (interaction.isChatInputCommand()) {
    const command = (interaction.client as any).commands?.get(interaction.commandName);
    if (!command) {
      logger.warn({ commandName: interaction.commandName }, "Unknown command");
      await interaction.reply({ embeds: [errorEmbed("Unknown Command", "This command does not exist.")], ephemeral: true });
      return;
    }
    try {
      await command.execute(interaction as ChatInputCommandInteraction);
      logger.info({ commandName: interaction.commandName, userId: interaction.user.id, guildId: interaction.guildId }, "Command executed");
    } catch (err) {
      logger.error({ err, commandName: interaction.commandName }, "Command error");
      const msg = errorEmbed("Error", "An unexpected error occurred.");
      if (interaction.replied || interaction.deferred) await interaction.followUp({ embeds: [msg], ephemeral: true });
      else await interaction.reply({ embeds: [msg], ephemeral: true });
    }
    return;
  }

  // ── Button interactions ─────────────────────────────────────────────────────
  if (interaction.isButton()) {
    await handleButton(interaction as ButtonInteraction);
    return;
  }
}

async function handleButton(interaction: ButtonInteraction): Promise<void> {
  const { customId, guild, member } = interaction;
  if (!guild || !member) return;

  // ── Ticket buttons ──────────────────────────────────────────────────────────
  if (customId === "ticket:create") {
    if (!isDbConnected()) {
      await interaction.reply({ content: "❌ Database not connected.", ephemeral: true });
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    const guildMember = member as GuildMember;

    // Find panel by message
    const panel = await TicketPanel.findOne({ guildId: guild.id, messageId: interaction.message.id });

    const result = await TicketService.openTicket(guild, guildMember, panel?.id);
    if (result.alreadyOpen) {
      await interaction.editReply({ content: `❌ You already have an open ticket: <#${result.channelId}>` });
      return;
    }
    if (!result.ok) {
      await interaction.editReply({ content: `❌ ${result.error}` });
      return;
    }
    await interaction.editReply({ content: `✅ Your ticket has been created: <#${result.channelId}>` });
    return;
  }

  if (customId.startsWith("ticket:close:")) {
    const channelId = customId.split(":")[2]!;
    await interaction.deferReply({ ephemeral: true });
    const result = await TicketService.closeTicket(guild, channelId, member as GuildMember);
    if (!result.ok) { await interaction.editReply({ content: `❌ ${result.error}` }); return; }
    await interaction.editReply({ content: "🔒 Closing ticket..." });
    return;
  }

  if (customId.startsWith("ticket:claim:")) {
    const channelId = customId.split(":")[2]!;
    await interaction.deferReply({ ephemeral: true });
    const result = await TicketService.claimTicket(guild, channelId, member as GuildMember);
    if (!result.ok) { await interaction.editReply({ content: `❌ ${result.error}` }); return; }
    await interaction.editReply({ content: "✅ You claimed this ticket." });
    return;
  }

  // ── Reaction role buttons ───────────────────────────────────────────────────
  if (customId.startsWith("rr:")) {
    if (!isDbConnected()) { await interaction.reply({ content: "❌ Database not connected.", ephemeral: true }); return; }
    await interaction.deferReply({ ephemeral: true });
    const roleId = customId.slice(3);
    const guildMember = member as GuildMember;

    const panel = await ReactionRolePanel.findOne({ guildId: guild.id, messageId: interaction.message.id });
    if (!panel) { await interaction.editReply({ content: "❌ Panel not found." }); return; }

    const role = guild.roles.cache.get(roleId);
    if (!role) { await interaction.editReply({ content: "❌ Role not found." }); return; }

    const hasRole = guildMember.roles.cache.has(roleId);

    // If exclusive, remove all other roles from this panel first
    if (panel.exclusive && !hasRole) {
      for (const entry of panel.entries) {
        if (entry.roleId !== roleId && guildMember.roles.cache.has(entry.roleId)) {
          await guildMember.roles.remove(entry.roleId).catch(() => {});
        }
      }
    }

    if (hasRole) {
      await guildMember.roles.remove(role).catch(() => {});
      await interaction.editReply({ content: `✅ Removed **${role.name}** from your roles.` });
    } else {
      await guildMember.roles.add(role).catch(() => {});
      await interaction.editReply({ content: `✅ Added **${role.name}** to your roles.` });
    }
    return;
  }

  // ── Suggestion vote buttons ─────────────────────────────────────────────────
  if (customId === "sug:up" || customId === "sug:down") {
    if (!isDbConnected()) { await interaction.reply({ content: "❌ Database not connected.", ephemeral: true }); return; }
    await interaction.deferReply({ ephemeral: true });

    const suggestion = await Suggestion.findOne({ guildId: guild.id, messageId: interaction.message.id });
    if (!suggestion) { await interaction.editReply({ content: "❌ Suggestion not found." }); return; }

    const userId = interaction.user.id;
    const isUp = customId === "sug:up";

    // Toggle vote
    if (isUp) {
      if (suggestion.upvotes.includes(userId)) {
        suggestion.upvotes = suggestion.upvotes.filter(id => id !== userId);
        await interaction.editReply({ content: "Removed your upvote." });
      } else {
        suggestion.upvotes.push(userId);
        suggestion.downvotes = suggestion.downvotes.filter(id => id !== userId);
        await interaction.editReply({ content: "👍 Upvoted!" });
      }
    } else {
      if (suggestion.downvotes.includes(userId)) {
        suggestion.downvotes = suggestion.downvotes.filter(id => id !== userId);
        await interaction.editReply({ content: "Removed your downvote." });
      } else {
        suggestion.downvotes.push(userId);
        suggestion.upvotes = suggestion.upvotes.filter(id => id !== userId);
        await interaction.editReply({ content: "👎 Downvoted." });
      }
    }
    await suggestion.save();

    // Update vote count in embed
    const msg = interaction.message;
    const oldEmbed = msg.embeds[0];
    if (oldEmbed) {
      const embed = new EmbedBuilder(oldEmbed.data)
        .spliceFields(2, 1, { name: "Votes", value: `👍 ${suggestion.upvotes.length} | 👎 ${suggestion.downvotes.length}`, inline: true });
      await msg.edit({ embeds: [embed] }).catch(() => {});
    }
    return;
  }
}
