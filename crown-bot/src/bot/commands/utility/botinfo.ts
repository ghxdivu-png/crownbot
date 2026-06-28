import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

const START_TIME = Date.now();

export const data = new SlashCommandBuilder()
  .setName("botinfo")
  .setDescription("Display information about this bot");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const client = interaction.client;
  const uptimeMs = Date.now() - START_TIME;
  const days = Math.floor(uptimeMs / 86_400_000);
  const hours = Math.floor((uptimeMs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((uptimeMs % 3_600_000) / 60_000);
  const seconds = Math.floor((uptimeMs % 60_000) / 1000);

  const totalUsers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("🤖 Bot Information")
    .setThumbnail(client.user?.displayAvatarURL() ?? null)
    .addFields(
      { name: "Name", value: client.user?.tag ?? "Unknown", inline: true },
      { name: "ID", value: client.user?.id ?? "Unknown", inline: true },
      { name: "Servers", value: client.guilds.cache.size.toString(), inline: true },
      { name: "Users", value: totalUsers.toLocaleString(), inline: true },
      { name: "Uptime", value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true },
      { name: "Ping", value: `${client.ws.ping}ms`, inline: true },
      { name: "discord.js", value: "v14", inline: true },
      { name: "Node.js", value: process.version, inline: true },
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
