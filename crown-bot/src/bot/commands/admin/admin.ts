import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { isDbConnected } from "../../database/connection.js";
import { errorEmbed } from "../../utils/embeds.js";
import os from "os";

const OWNER_IDS = (process.env.OWNER_IDS ?? "").split(",").filter(Boolean);
const startTime = Date.now();

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return [d && `${d}d`, h && `${h}h`, m && `${m}m`, `${sec}s`].filter(Boolean).join(" ");
}

export const data = new SlashCommandBuilder()
  .setName("admin")
  .setDescription("Bot administration commands")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand(s => s.setName("status").setDescription("Show bot health and diagnostics"))
  .addSubcommand(s => s.setName("stats").setDescription("Show global bot statistics"))
  .addSubcommand(s => s.setName("sync").setDescription("Force re-register slash commands (owner only)"));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const sub = interaction.options.getSubcommand();
  await interaction.deferReply({ ephemeral: true });

  if (sub === "sync") {
    if (!OWNER_IDS.includes(interaction.user.id)) {
      await interaction.editReply({ embeds: [errorEmbed("Access Denied", "Only the bot owner can use this.")] });
      return;
    }
    // Re-register commands
    const { registerSlashCommands } = await import("../../handlers/registerCommands.js");
    await registerSlashCommands();
    await interaction.editReply({ content: "✅ Slash commands re-synced!" });
    return;
  }

  const memUsage = process.memoryUsage();
  const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  const client = interaction.client;

  if (sub === "status") {
    const embed = new EmbedBuilder()
      .setTitle("🔧 Bot Diagnostics")
      .setColor(isDbConnected() ? 0x57F287 : 0xED4245)
      .addFields(
        { name: "Uptime", value: formatUptime(Date.now() - startTime), inline: true },
        { name: "Database", value: isDbConnected() ? "✅ Connected" : "❌ Disconnected", inline: true },
        { name: "Ping", value: `${client.ws.ping}ms`, inline: true },
        { name: "Guilds", value: `${client.guilds.cache.size}`, inline: true },
        { name: "Users", value: `${client.users.cache.size}`, inline: true },
        { name: "Channels", value: `${client.channels.cache.size}`, inline: true },
        { name: "Heap Used", value: mb(memUsage.heapUsed), inline: true },
        { name: "Heap Total", value: mb(memUsage.heapTotal), inline: true },
        { name: "RSS", value: mb(memUsage.rss), inline: true },
        { name: "Node.js", value: process.version, inline: true },
        { name: "Platform", value: `${os.platform()} ${os.arch()}`, inline: true },
        { name: "CPU Cores", value: `${os.cpus().length}`, inline: true },
      )
      .setFooter({ text: "Crown Bot 👑 | Admin Panel" })
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
    return;
  }

  if (sub === "stats") {
    const commands = (client as any).commands?.size ?? 0;
    const embed = new EmbedBuilder()
      .setTitle("📊 Global Statistics")
      .setColor(0x5865F2)
      .addFields(
        { name: "Servers", value: `${client.guilds.cache.size}`, inline: true },
        { name: "Cached Users", value: `${client.users.cache.size}`, inline: true },
        { name: "Slash Commands", value: `${commands}`, inline: true },
        { name: "Uptime", value: formatUptime(Date.now() - startTime), inline: true },
        { name: "Node.js", value: process.version, inline: true },
        { name: "Discord.js", value: "v14", inline: true },
      )
      .setFooter({ text: "Crown Bot 👑" })
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  }
}
