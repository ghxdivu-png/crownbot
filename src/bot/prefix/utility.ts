import { Message, EmbedBuilder } from "discord.js";
import { embed, infoEmbed } from "./embeds.js";

const startTime = Date.now();

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return [d && `${d}d`, h && `${h}h`, m && `${m}m`, `${sec}s`].filter(Boolean).join(" ");
}

export async function runUtilityCommand(cmd: string, args: string[], msg: Message): Promise<boolean> {
  switch (cmd) {
    case "ping": {
      const sent = await msg.reply({ embeds: [embed({ description: "Pinging... 🏓" })] });
      const latency = sent.createdTimestamp - msg.createdTimestamp;
      const apiLatency = Math.round(msg.client.ws.ping);
      await sent.edit({ embeds: [embed({
        title: "🏓 Pong!",
        fields: [
          { name: "Bot Latency", value: `\`${latency}ms\``, inline: true },
          { name: "API Latency", value: `\`${apiLatency}ms\``, inline: true },
        ],
        color: latency < 100 ? 0x57F287 : latency < 250 ? 0xFEE75C : 0xED4245,
      })] });
      return true;
    }
    case "serverinfo": {
      const g = msg.guild!;
      await g.fetch();
      await msg.reply({ embeds: [embed({
        title: `🏠 ${g.name}`,
        thumbnail: g.iconURL() ?? undefined,
        fields: [
          { name: "Owner", value: `<@${g.ownerId}>`, inline: true },
          { name: "Members", value: `${g.memberCount}`, inline: true },
          { name: "Channels", value: `${g.channels.cache.size}`, inline: true },
          { name: "Roles", value: `${g.roles.cache.size}`, inline: true },
          { name: "Boosts", value: `${g.premiumSubscriptionCount ?? 0}`, inline: true },
          { name: "Created", value: `<t:${Math.floor(g.createdTimestamp / 1000)}:R>`, inline: true },
        ],
        color: 0x5865F2,
      })] });
      return true;
    }
    case "userinfo": {
      const target = msg.mentions.members?.first() ?? msg.member!;
      const user = target.user;
      await msg.reply({ embeds: [embed({
        title: `👤 ${user.tag}`,
        thumbnail: user.displayAvatarURL({ size: 256 }),
        fields: [
          { name: "ID", value: user.id, inline: true },
          { name: "Nickname", value: target.nickname ?? "None", inline: true },
          { name: "Top Role", value: `${target.roles.highest}`, inline: true },
          { name: "Joined Server", value: `<t:${Math.floor((target.joinedTimestamp ?? 0) / 1000)}:R>`, inline: true },
          { name: "Account Created", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
          { name: "Bot?", value: user.bot ? "Yes 🤖" : "No 👤", inline: true },
        ],
        color: 0x9B59B6,
      })] });
      return true;
    }
    case "avatar": {
      const target = msg.mentions.users.first() ?? msg.author;
      await msg.reply({ embeds: [embed({
        title: `🖼️ ${target.username}'s Avatar`,
        image: target.displayAvatarURL({ size: 512 }),
        color: 0x3498DB,
      })] });
      return true;
    }
    case "botinfo": {
      const client = msg.client;
      await msg.reply({ embeds: [embed({
        title: "🤖 Bot Info",
        thumbnail: client.user?.displayAvatarURL() ?? undefined,
        fields: [
          { name: "Name", value: client.user?.tag ?? "Unknown", inline: true },
          { name: "Servers", value: `${client.guilds.cache.size}`, inline: true },
          { name: "Users", value: `${client.users.cache.size}`, inline: true },
          { name: "Uptime", value: formatUptime(Date.now() - startTime), inline: true },
          { name: "Library", value: "discord.js v14", inline: true },
          { name: "Node.js", value: process.version, inline: true },
        ],
        color: 0x57F287,
      })] });
      return true;
    }
    case "uptime": {
      await msg.reply({ embeds: [embed({
        title: "⏱️ Uptime",
        description: `I've been online for **${formatUptime(Date.now() - startTime)}** 💪`,
        color: 0x57F287,
      })] });
      return true;
    }
    default:
      return false;
  }
}
