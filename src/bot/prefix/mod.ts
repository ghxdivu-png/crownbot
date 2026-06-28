import { Message, PermissionFlagsBits, GuildMember, TextChannel } from "discord.js";
import { embed, successEmbed, errorEmbed } from "./embeds.js";
import { addWarning, getWarnings, clearWarnings } from "./store.js";
import { sendModLog } from "./modlog.js";

function parseDuration(str: string): number | null {
  const match = str.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;
  const n = parseInt(match[1]!);
  const unit = match[2];
  if (unit === "s") return n * 1000;
  if (unit === "m") return n * 60_000;
  if (unit === "h") return n * 3_600_000;
  if (unit === "d") return n * 86_400_000;
  return null;
}

function formatDuration(ms: number): string {
  if (ms < 60_000) return `${ms / 1000}s`;
  if (ms < 3_600_000) return `${ms / 60_000}m`;
  if (ms < 86_400_000) return `${ms / 3_600_000}h`;
  return `${ms / 86_400_000}d`;
}

export async function runModCommand(cmd: string, args: string[], msg: Message): Promise<boolean> {
  if (!msg.guild) return false;
  const member = msg.member as GuildMember;

  switch (cmd) {
    case "kick": {
      if (!member.permissions.has(PermissionFlagsBits.KickMembers))
        return reply(msg, errorEmbed("You need **Kick Members** permission."));
      const target = msg.mentions.members?.first();
      if (!target) return reply(msg, errorEmbed("Mention someone to kick!"));
      const reason = args.slice(1).join(" ") || "No reason provided";
      await target.kick(reason);
      await reply(msg, successEmbed(`Kicked **${target.user.tag}** — ${reason}`));
      await sendModLog(msg.guild, "👟 Kick", target.user, reason, msg.author);
      return true;
    }
    case "ban": {
      if (!member.permissions.has(PermissionFlagsBits.BanMembers))
        return reply(msg, errorEmbed("You need **Ban Members** permission."));
      const target = msg.mentions.members?.first();
      if (!target) return reply(msg, errorEmbed("Mention someone to ban!"));
      const reason = args.slice(1).join(" ") || "No reason provided";
      await target.ban({ reason, deleteMessageSeconds: 86400 });
      await reply(msg, successEmbed(`Banned **${target.user.tag}** — ${reason} 🔨`));
      await sendModLog(msg.guild, "🔨 Ban", target.user, reason, msg.author);
      return true;
    }
    case "unban": {
      if (!member.permissions.has(PermissionFlagsBits.BanMembers))
        return reply(msg, errorEmbed("You need **Ban Members** permission."));
      const userId = args[0];
      if (!userId) return reply(msg, errorEmbed("Provide a user ID to unban."));
      await msg.guild.bans.remove(userId, `Unbanned by ${msg.author.tag}`);
      await reply(msg, successEmbed(`Unbanned user \`${userId}\``));
      return true;
    }
    case "timeout": {
      if (!member.permissions.has(PermissionFlagsBits.ModerateMembers))
        return reply(msg, errorEmbed("You need **Timeout Members** permission."));
      const target = msg.mentions.members?.first();
      const durStr = args[1] ?? "10m";
      const duration = parseDuration(durStr);
      if (!target) return reply(msg, errorEmbed("Mention someone to timeout!"));
      if (!duration) return reply(msg, errorEmbed("Use format like `10m`, `1h`, `1d`"));
      const reason = args.slice(2).join(" ") || "No reason provided";
      await target.timeout(duration, reason);
      await reply(msg, successEmbed(`⏰ Timed out **${target.user.tag}** for **${formatDuration(duration)}** — ${reason}`));
      await sendModLog(msg.guild, "⏰ Timeout", target.user, reason, msg.author, `Duration: ${formatDuration(duration)}`);
      return true;
    }
    case "untimeout": {
      if (!member.permissions.has(PermissionFlagsBits.ModerateMembers))
        return reply(msg, errorEmbed("You need **Timeout Members** permission."));
      const target = msg.mentions.members?.first();
      if (!target) return reply(msg, errorEmbed("Mention someone to un-timeout!"));
      await target.timeout(null);
      await reply(msg, successEmbed(`✅ Removed timeout from **${target.user.tag}**`));
      return true;
    }
    case "warn": {
      if (!member.permissions.has(PermissionFlagsBits.ManageMessages))
        return reply(msg, errorEmbed("You need **Manage Messages** permission."));
      const target = msg.mentions.users.first();
      if (!target) return reply(msg, errorEmbed("Mention someone to warn!"));
      const reason = args.slice(1).join(" ") || "No reason provided";
      const count = addWarning(msg.guild.id, target.id, reason);
      await reply(msg, embed({
        title: "⚠️ Warning Issued",
        description: `${target} has been warned.\n**Reason:** ${reason}\n**Total warnings:** ${count}`,
        color: 0xFEE75C,
      }));
      await sendModLog(msg.guild, "⚠️ Warn", target, reason, msg.author, `Total: ${count} warnings`);
      return true;
    }
    case "warnings": {
      const target = msg.mentions.users.first() ?? msg.author;
      const warns = getWarnings(msg.guild.id, target.id);
      if (!warns.length) return reply(msg, embed({ description: `${target} has no warnings. 🌟`, color: 0x57F287 }));
      return reply(msg, embed({
        title: `⚠️ Warnings for ${target.tag}`,
        description: warns.map((w, i) => `**${i + 1}.** ${w}`).join("\n"),
        color: 0xFEE75C,
      }));
    }
    case "clearwarnings": {
      if (!member.permissions.has(PermissionFlagsBits.ManageMessages))
        return reply(msg, errorEmbed("You need **Manage Messages** permission."));
      const target = msg.mentions.users.first();
      if (!target) return reply(msg, errorEmbed("Mention someone to clear warnings for!"));
      clearWarnings(msg.guild.id, target.id);
      await reply(msg, successEmbed(`Cleared all warnings for **${target.tag}**`));
      return true;
    }
    case "purge":
    case "clear": {
      if (!member.permissions.has(PermissionFlagsBits.ManageMessages))
        return reply(msg, errorEmbed("You need **Manage Messages** permission."));
      const n = parseInt(args[0] ?? "10");
      if (isNaN(n) || n < 1 || n > 100) return reply(msg, errorEmbed("Provide a number between 1–100."));
      await msg.channel.messages.fetch({ limit: n + 1 }).then(msgs => (msg.channel as any).bulkDelete(msgs)).catch(() => {});
      const notice = await (msg.channel as TextChannel).send({ embeds: [successEmbed(`Deleted **${n}** messages 🗑️`)] });
      setTimeout(() => notice.delete().catch(() => {}), 4000);
      return true;
    }
    default:
      return false;
  }
}

async function reply(msg: Message, e: any): Promise<true> {
  await msg.reply({ embeds: [e] }).catch(() => {});
  return true;
}
