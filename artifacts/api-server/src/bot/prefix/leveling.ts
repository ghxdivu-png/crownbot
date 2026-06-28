import { Message } from "discord.js";
import { embed, errorEmbed } from "./embeds.js";
import { getUserXP, getLeaderboard, claimDaily, xpNeededForLevel } from "./store.js";

function buildBar(current: number, needed: number, len = 12): string {
  const filled = Math.round((current / needed) * len);
  return "█".repeat(Math.min(filled, len)) + "░".repeat(Math.max(0, len - filled));
}

function msToHuman(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h ? `${h}h ${m}m` : `${m}m`;
}

export async function runLevelingCommand(cmd: string, args: string[], msg: Message): Promise<boolean> {
  if (!msg.guild) return false;

  switch (cmd) {
    case "rank": {
      const target = msg.mentions.members?.first() ?? msg.member!;
      const data = getUserXP(msg.guild.id, target.user.id);
      const needed = xpNeededForLevel(data.level + 1);
      const progress = data.xp - [...Array(data.level).keys()].reduce((sum, l) => sum + xpNeededForLevel(l + 1), 0);
      await msg.reply({ embeds: [embed({
        title: `📊 ${target.user.username}'s Rank`,
        thumbnail: target.user.displayAvatarURL({ size: 256 }),
        description:
          `**Level:** ${data.level}\n` +
          `**Total XP:** ${data.xp.toLocaleString()}\n\n` +
          `\`${buildBar(progress, needed)}\` ${progress}/${needed} XP`,
        color: 0x5865F2,
      })] });
      return true;
    }
    case "leaderboard":
    case "lb": {
      const board = getLeaderboard(msg.guild.id, 10);
      if (!board.length) {
        await msg.reply({ embeds: [embed({ description: "No one has XP yet! Start chatting 💬", color: 0x5865F2 })] });
        return true;
      }
      const medals = ["🥇","🥈","🥉"];
      const lines = board.map((u, i) => {
        const name = msg.client.users.cache.get(u.userId)?.username ?? u.userId;
        return `${medals[i] ?? `**${i + 1}.**`} **${name}** — Level ${u.level} (${u.xp.toLocaleString()} XP)`;
      });
      await msg.reply({ embeds: [embed({
        title: "🏆 XP Leaderboard",
        description: lines.join("\n"),
        color: 0xFEE75C,
      })] });
      return true;
    }
    case "daily": {
      const result = claimDaily(msg.guild.id, msg.author.id);
      if (!result.ok) {
        await msg.reply({ embeds: [errorEmbed(`You already claimed today's reward!\nCome back in **${msToHuman(result.msLeft!)}** ⏳`)] });
        return true;
      }
      await msg.reply({ embeds: [embed({
        title: "🎁 Daily Reward Claimed!",
        description: `+**500 XP** added to your account!\nCome back tomorrow for more! 💛`,
        color: 0xFEE75C,
      })] });
      return true;
    }
    default:
      return false;
  }
}
