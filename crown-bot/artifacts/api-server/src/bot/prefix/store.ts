import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "botdata.json");

interface UserXP { xp: number; level: number; lastMessage: number }
interface GuildSettings {
  modLogChannel?: string;
  welcomeChannel?: string;
  goodbyeChannel?: string;
  autoRole?: string;
  antiLink: boolean;
  badWords: string[];
}

interface Store {
  warnings: Record<string, Record<string, string[]>>;
  xp: Record<string, Record<string, UserXP>>;
  daily: Record<string, Record<string, number>>;
  settings: Record<string, GuildSettings>;
}

const DEFAULT_SETTINGS: GuildSettings = { antiLink: false, badWords: ["badword1","nigga","nigger","fuck","shit","bitch","cunt","asshole"] };

let store: Store = { warnings: {}, xp: {}, daily: {}, settings: {} };

export function loadStore(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(DATA_FILE)) {
      store = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    }
  } catch { /* fresh start */ }
}

function save(): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
  } catch { /* ignore write errors */ }
}

// Settings
export function getSettings(guildId: string): GuildSettings {
  if (!store.settings[guildId]) store.settings[guildId] = { ...DEFAULT_SETTINGS };
  return store.settings[guildId];
}
export function setSettings(guildId: string, patch: Partial<GuildSettings>): void {
  store.settings[guildId] = { ...getSettings(guildId), ...patch };
  save();
}

// Warnings
export function addWarning(guildId: string, userId: string, reason: string): number {
  if (!store.warnings[guildId]) store.warnings[guildId] = {};
  if (!store.warnings[guildId][userId]) store.warnings[guildId][userId] = [];
  store.warnings[guildId][userId].push(reason);
  save();
  return store.warnings[guildId][userId].length;
}
export function getWarnings(guildId: string, userId: string): string[] {
  return store.warnings[guildId]?.[userId] ?? [];
}
export function clearWarnings(guildId: string, userId: string): void {
  if (store.warnings[guildId]) delete store.warnings[guildId][userId];
  save();
}

// XP / Leveling
const XP_PER_MSG_MIN = 15, XP_PER_MSG_MAX = 25;
const XP_COOLDOWN_MS = 60_000;

export function xpNeededForLevel(level: number): number {
  return 5 * level * level + 50 * level + 100;
}

export function addXP(guildId: string, userId: string): { leveled: boolean; level: number } | null {
  if (!store.xp[guildId]) store.xp[guildId] = {};
  const now = Date.now();
  const user: UserXP = store.xp[guildId][userId] ?? { xp: 0, level: 0, lastMessage: 0 };
  if (now - user.lastMessage < XP_COOLDOWN_MS) return null;
  const gain = Math.floor(Math.random() * (XP_PER_MSG_MAX - XP_PER_MSG_MIN + 1)) + XP_PER_MSG_MIN;
  user.xp += gain;
  user.lastMessage = now;
  const needed = xpNeededForLevel(user.level + 1);
  let leveled = false;
  if (user.xp >= needed) { user.level += 1; leveled = true; }
  store.xp[guildId][userId] = user;
  save();
  return { leveled, level: user.level };
}

export function getUserXP(guildId: string, userId: string): UserXP {
  return store.xp[guildId]?.[userId] ?? { xp: 0, level: 0, lastMessage: 0 };
}

export function getLeaderboard(guildId: string, limit = 10): Array<{ userId: string; xp: number; level: number }> {
  const users = store.xp[guildId] ?? {};
  return Object.entries(users)
    .map(([userId, data]) => ({ userId, xp: data.xp, level: data.level }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit);
}

// Daily rewards
const DAILY_XP = 500;
export function claimDaily(guildId: string, userId: string): { ok: boolean; msLeft?: number } {
  if (!store.daily[guildId]) store.daily[guildId] = {};
  const last = store.daily[guildId][userId] ?? 0;
  const now = Date.now();
  const cooldown = 24 * 60 * 60 * 1000;
  if (now - last < cooldown) return { ok: false, msLeft: cooldown - (now - last) };
  store.daily[guildId][userId] = now;
  if (!store.xp[guildId]) store.xp[guildId] = {};
  const user: UserXP = store.xp[guildId][userId] ?? { xp: 0, level: 0, lastMessage: 0 };
  user.xp += DAILY_XP;
  store.xp[guildId][userId] = user;
  save();
  return { ok: true };
}
