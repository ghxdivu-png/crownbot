import {
  Guild, TextChannel, CategoryChannel, ButtonBuilder, ButtonStyle,
  ActionRowBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType,
  OverwriteType, GuildMember, Message,
} from "discord.js";
import { Ticket, TicketPanel, ITicketPanel } from "../database/models/Ticket.js";
import { getGuildConfig } from "../database/models/GuildConfig.js";
import { logger } from "../../lib/logger.js";

const TICKET_COLOR = 0x5865F2;

export class TicketService {
  /** Create a ticket panel with a button in a channel */
  static async createPanel(guild: Guild, channelId: string, opts: {
    title: string; description: string; color?: number; categoryId?: string; supportRoles?: string[];
  }): Promise<{ ok: boolean; error?: string }> {
    const channel = guild.channels.cache.get(channelId) as TextChannel | null;
    if (!channel) return { ok: false, error: "Channel not found" };

    const button = new ButtonBuilder()
      .setCustomId("ticket:create")
      .setLabel("🎫 Open a Ticket")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    const embed = new EmbedBuilder()
      .setTitle(opts.title)
      .setDescription(opts.description)
      .setColor(opts.color ?? TICKET_COLOR)
      .setFooter({ text: "Crown Bot 👑 | Click the button to open a ticket" })
      .setTimestamp();

    const msg = await channel.send({ embeds: [embed], components: [row] });

    await TicketPanel.create({
      guildId: guild.id,
      channelId,
      messageId: msg.id,
      title: opts.title,
      description: opts.description,
      color: opts.color ?? TICKET_COLOR,
      categoryId: opts.categoryId,
      supportRoles: opts.supportRoles ?? [],
    });

    return { ok: true };
  }

  /** Create a ticket channel when a user clicks the button */
  static async openTicket(guild: Guild, member: GuildMember, panelId?: string): Promise<{ ok: boolean; channelId?: string; error?: string; alreadyOpen?: boolean }> {
    // Check for existing open ticket
    const existing = await Ticket.findOne({ guildId: guild.id, userId: member.id, status: { $in: ["open", "claimed"] } });
    if (existing) return { ok: false, alreadyOpen: true, channelId: existing.channelId };

    const config = await getGuildConfig(guild.id);
    const panel = panelId ? await TicketPanel.findById(panelId) : await TicketPanel.findOne({ guildId: guild.id });

    // Increment counter
    const ticketNumber = (panel?.ticketCount ?? 0) + 1;
    if (panel) { panel.ticketCount = ticketNumber; await panel.save(); }

    // Resolve category
    const category = (panel?.categoryId ?? config.ticketLogChannel)
      ? guild.channels.cache.get(panel?.categoryId ?? "") as CategoryChannel | null
      : null;

    const supportRoles = panel?.supportRoles?.length
      ? panel.supportRoles
      : config.ticketSupportRoles;

    // Build permission overwrites
    const overwrites: any[] = [
      { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: member.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
    ];
    const botMember = guild.members.me;
    if (botMember) overwrites.push({ id: botMember.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ReadMessageHistory] });
    for (const roleId of supportRoles) {
      overwrites.push({ id: roleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
    }

    const ticketChannel = await guild.channels.create({
      name: `ticket-${ticketNumber.toString().padStart(4, "0")}`,
      type: ChannelType.GuildText,
      parent: category ?? undefined,
      permissionOverwrites: overwrites,
      topic: `Ticket #${ticketNumber} | Opened by ${member.user.tag}`,
    });

    // Save ticket
    await Ticket.create({
      guildId: guild.id,
      channelId: ticketChannel.id,
      panelId: panel?.id ?? "default",
      ticketNumber,
      userId: member.id,
      status: "open",
    });

    // Send welcome message in ticket
    const closeButton = new ButtonBuilder().setCustomId(`ticket:close:${ticketChannel.id}`).setLabel("🔒 Close").setStyle(ButtonStyle.Danger);
    const claimButton = new ButtonBuilder().setCustomId(`ticket:claim:${ticketChannel.id}`).setLabel("✋ Claim").setStyle(ButtonStyle.Success);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton, claimButton);

    const embed = new EmbedBuilder()
      .setTitle(`🎫 Ticket #${ticketNumber}`)
      .setDescription(`Hey ${member}! Support will be with you shortly.\n\nPlease describe your issue clearly.`)
      .setColor(TICKET_COLOR)
      .addFields(
        { name: "Opened By", value: `${member.user.tag}`, inline: true },
        { name: "Ticket #", value: `${ticketNumber}`, inline: true },
        { name: "Status", value: "🟢 Open", inline: true },
      )
      .setFooter({ text: "Crown Bot 👑 | Click 🔒 to close this ticket" })
      .setTimestamp();

    await ticketChannel.send({ content: `${member} ${supportRoles.map(r => `<@&${r}>`).join(" ")}`, embeds: [embed], components: [row] });

    // Log
    await TicketService.sendTicketLog(guild, config.ticketLogChannel, `🎫 Ticket Opened`, `Ticket #${ticketNumber} opened by ${member.user.tag}`, TICKET_COLOR);

    return { ok: true, channelId: ticketChannel.id };
  }

  /** Close a ticket */
  static async closeTicket(guild: Guild, channelId: string, closedBy: GuildMember, reason?: string): Promise<{ ok: boolean; error?: string }> {
    const ticket = await Ticket.findOne({ guildId: guild.id, channelId, status: { $ne: "closed" } });
    if (!ticket) return { ok: false, error: "No open ticket found for this channel" };

    ticket.status = "closed";
    ticket.closedAt = new Date();
    ticket.closedBy = closedBy.id;
    ticket.closeReason = reason ?? "No reason provided";
    await ticket.save();

    const channel = guild.channels.cache.get(channelId) as TextChannel | null;
    if (channel) {
      const transcript = await TicketService.generateTranscript(channel, ticket.ticketNumber);
      const config = await getGuildConfig(guild.id);
      await TicketService.sendTicketLog(guild, config.ticketLogChannel,
        "🔒 Ticket Closed",
        `Ticket #${ticket.ticketNumber} closed by ${closedBy.user.tag}\n**Reason:** ${reason ?? "No reason"}\n**Transcript:**\n${transcript.slice(0, 1000)}`,
        0xED4245
      );

      const embed = new EmbedBuilder()
        .setTitle("🔒 Ticket Closed")
        .setDescription(`This ticket has been closed by ${closedBy}.\n**Reason:** ${reason ?? "No reason"}`)
        .setColor(0xED4245)
        .setFooter({ text: "Crown Bot 👑 | This channel will be deleted in 10 seconds" })
        .setTimestamp();

      await channel.send({ embeds: [embed] });
      setTimeout(() => channel.delete("Ticket closed").catch(() => {}), 10_000);
    }

    return { ok: true };
  }

  /** Claim a ticket */
  static async claimTicket(guild: Guild, channelId: string, claimer: GuildMember): Promise<{ ok: boolean; error?: string }> {
    const ticket = await Ticket.findOne({ guildId: guild.id, channelId, status: { $ne: "closed" } });
    if (!ticket) return { ok: false, error: "No open ticket found" };

    ticket.claimedBy = claimer.id;
    ticket.status = "claimed";
    await ticket.save();

    const channel = guild.channels.cache.get(channelId) as TextChannel | null;
    if (channel) {
      const embed = new EmbedBuilder()
        .setDescription(`✋ ${claimer} has claimed this ticket and will assist you!`)
        .setColor(0x57F287)
        .setTimestamp();
      await channel.send({ embeds: [embed] });
    }

    return { ok: true };
  }

  /** Generate a text transcript from recent messages */
  static async generateTranscript(channel: TextChannel, ticketNumber: number): Promise<string> {
    try {
      const messages = await channel.messages.fetch({ limit: 100 });
      const sorted = [...messages.values()].reverse();
      const lines = sorted.map(m =>
        `[${m.createdAt.toISOString()}] ${m.author.tag}: ${m.content || (m.embeds.length ? "[Embed]" : "[Attachment]")}`
      );
      return `Ticket #${ticketNumber} Transcript\n${"─".repeat(40)}\n${lines.join("\n")}`;
    } catch {
      return `Ticket #${ticketNumber} — Could not generate transcript`;
    }
  }

  private static async sendTicketLog(guild: Guild, logChannelId: string | undefined, title: string, description: string, color: number) {
    if (!logChannelId) return;
    const ch = guild.channels.cache.get(logChannelId) as TextChannel | null;
    if (!ch) return;
    const embed = new EmbedBuilder().setTitle(title).setDescription(description).setColor(color).setTimestamp();
    await ch.send({ embeds: [embed] }).catch(() => {});
  }
}
