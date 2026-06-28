import mongoose, { Schema, Document } from "mongoose";

export interface IGuildConfig extends Document {
  guildId: string;
  // Logging
  modLogChannel?: string;
  messageLogChannel?: string;
  memberLogChannel?: string;
  // Welcome / Goodbye
  welcomeChannel?: string;
  welcomeMessage?: string;
  goodbyeChannel?: string;
  goodbyeMessage?: string;
  autoRole?: string;
  dmWelcome: boolean;
  // Ticket system
  ticketLogChannel?: string;
  ticketSupportRoles: string[];
  // Suggestions
  suggestionChannel?: string;
  // Automod
  automod: {
    enabled: boolean;
    antiSpam: boolean;
    antiFlood: boolean;
    antiInvite: boolean;
    antiLinks: boolean;
    antiMentionSpam: boolean;
    antiCaps: boolean;
    antiDuplicate: boolean;
    spamThreshold: number;
    mentionThreshold: number;
    capsThreshold: number;
    blockedWords: string[];
    whitelistChannels: string[];
    whitelistRoles: string[];
    punishmentType: "delete" | "warn" | "timeout" | "kick" | "ban";
    timeoutDuration: number;
    warnThresholdAction: "timeout" | "kick" | "ban" | "none";
    warnThreshold: number;
  };
  // Features
  features: {
    leveling: boolean;
    welcomeGifs: boolean;
  };
  updatedAt: Date;
}

const GuildConfigSchema = new Schema<IGuildConfig>({
  guildId: { type: String, required: true, unique: true, index: true },
  modLogChannel: String,
  messageLogChannel: String,
  memberLogChannel: String,
  welcomeChannel: String,
  welcomeMessage: { type: String, default: "Welcome to the server, {user}! 🎉" },
  goodbyeChannel: String,
  goodbyeMessage: { type: String, default: "**{user}** has left the server. 👋" },
  autoRole: String,
  dmWelcome: { type: Boolean, default: false },
  ticketLogChannel: String,
  ticketSupportRoles: { type: [String], default: [] },
  suggestionChannel: String,
  automod: {
    enabled: { type: Boolean, default: false },
    antiSpam: { type: Boolean, default: true },
    antiFlood: { type: Boolean, default: true },
    antiInvite: { type: Boolean, default: false },
    antiLinks: { type: Boolean, default: false },
    antiMentionSpam: { type: Boolean, default: true },
    antiCaps: { type: Boolean, default: false },
    antiDuplicate: { type: Boolean, default: false },
    spamThreshold: { type: Number, default: 5 },
    mentionThreshold: { type: Number, default: 5 },
    capsThreshold: { type: Number, default: 70 },
    blockedWords: { type: [String], default: [] },
    whitelistChannels: { type: [String], default: [] },
    whitelistRoles: { type: [String], default: [] },
    punishmentType: { type: String, default: "delete", enum: ["delete", "warn", "timeout", "kick", "ban"] },
    timeoutDuration: { type: Number, default: 300000 },
    warnThresholdAction: { type: String, default: "timeout", enum: ["timeout", "kick", "ban", "none"] },
    warnThreshold: { type: Number, default: 3 },
  },
  features: {
    leveling: { type: Boolean, default: true },
    welcomeGifs: { type: Boolean, default: true },
  },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const GuildConfig = mongoose.model<IGuildConfig>("GuildConfig", GuildConfigSchema);

export async function getGuildConfig(guildId: string): Promise<IGuildConfig> {
  let config = await GuildConfig.findOne({ guildId });
  if (!config) config = await GuildConfig.create({ guildId });
  return config;
}
