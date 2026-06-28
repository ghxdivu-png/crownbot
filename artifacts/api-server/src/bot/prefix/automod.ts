import { Message, TextChannel, GuildMember, PermissionFlagsBits } from "discord.js";
import { getSettings } from "./store.js";
import { embed } from "./embeds.js";
import { sendModLog } from "./modlog.js";

// --- Spam tracker (in-memory) ---
const spamMap = new Map<string, { count: number; reset: ReturnType<typeof setTimeout> }>();
const SPAM_LIMIT = 5, SPAM_WINDOW_MS = 4000;

// --- Anti-raid (in-memory) ---
const raidJoins: number[] = [];
const RAID_LIMIT = 8, RAID_WINDOW_MS = 10_000;
let raidLocked = false;

export function checkRaid(): boolean {
  const now = Date.now();
  raidJoins.push(now);
  while (raidJoins.length && raidJoins[0]! < now - RAID_WINDOW_MS) raidJoins.shift();
  if (raidJoins.length >= RAID_LIMIT) { raidLocked = true; return true; }
  return false;
}
export function isRaidLocked(): boolean { return raidLocked; }
export function clearRaidLock(): void { raidLocked = false; raidJoins.length = 0; }

export async function runAutomod(message: Message): Promise<boolean> {
  if (!message.guild || message.author.bot) return false;
  const member = message.member as GuildMember;
  const settings = getSettings(message.guild.id);
  const botMember = message.guild.members.me;
  const canDelete = botMember?.permissions.has(PermissionFlagsBits.ManageMessages) ?? false;
  const canTimeout = botMember?.permissions.has(PermissionFlagsBits.ModerateMembers) ?? false;
  const isModOrAdmin = member.permissions.has(PermissionFlagsBits.ManageMessages);
  if (isModOrAdmin) return false;

  // Bad words
  const content = message.content.toLowerCase();
  const hasBadWord = settings.badWords.some(w => content.includes(w.toLowerCase()));
  if (hasBadWord) {
    if (canDelete) await message.delete().catch(() => {});
    const warn = await (message.channel as TextChannel).send({ embeds: [embed({ description: `⚠️ Hey ${message.author}, watch your language! Keep it clean. 🧹`, color: 0xFEE75C })] });
    await sendModLog(message.guild, "🤬 Bad Word", message.author, `Deleted message with bad language`, "automod");
    setTimeout(() => warn.delete().catch(() => {}), 5000);
    return true;
  }

  // Anti-link (Discord invite links)
  const inviteRegex = /discord(?:\.gg|app\.com\/invite|\.com\/invite)\/\S+/i;
  if (settings.antiLink && inviteRegex.test(message.content)) {
    if (canDelete) await message.delete().catch(() => {});
    const warn = await (message.channel as TextChannel).send({ embeds: [embed({ description: `🚫 ${message.author} No invite links allowed here!`, color: 0xED4245 })] });
    await sendModLog(message.guild, "🔗 Anti-Link", message.author, `Posted invite link`, "automod");
    setTimeout(() => warn.delete().catch(() => {}), 5000);
    return true;
  }

  // Anti-spam
  const key = `${message.guild.id}:${message.author.id}`;
  const entry = spamMap.get(key) ?? { count: 0, reset: undefined as any };
  entry.count++;
  if (entry.reset) clearTimeout(entry.reset);
  entry.reset = setTimeout(() => spamMap.delete(key), SPAM_WINDOW_MS);
  spamMap.set(key, entry);

  if (entry.count >= SPAM_LIMIT) {
    spamMap.delete(key);
    if (canDelete) {
      const msgs = await message.channel.messages.fetch({ limit: 10 }).catch(() => null);
      if (msgs) {
        const spamMsgs = msgs.filter(m => m.author.id === message.author.id);
        await (message.channel as TextChannel).bulkDelete(spamMsgs).catch(() => {});
      }
    }
    if (canTimeout) {
      await member.timeout(5 * 60 * 1000, "Anti-spam").catch(() => {});
    }
    await (message.channel as TextChannel).send({ embeds: [embed({ description: `🛑 ${message.author} Chill bro! No spamming. Timed out for 5 mins. ⏰`, color: 0xED4245 })] });
    await sendModLog(message.guild, "🛑 Anti-Spam", message.author, `Auto-timed out for spamming`, "automod");
    return true;
  }

  return false;
}
