import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

const START_TIME = Date.now();

export const data = new SlashCommandBuilder()
  .setName("uptime")
  .setDescription("Check how long the bot has been online");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const uptimeMs = Date.now() - START_TIME;
  const days = Math.floor(uptimeMs / 86_400_000);
  const hours = Math.floor((uptimeMs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((uptimeMs % 3_600_000) / 60_000);
  const seconds = Math.floor((uptimeMs % 60_000) / 1000);

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle("⏱️ Bot Uptime")
    .setDescription(`The bot has been online for:\n\n**${days}d ${hours}h ${minutes}m ${seconds}s**`)
    .addFields({ name: "Online Since", value: `<t:${Math.floor((Date.now() - uptimeMs) / 1000)}:F>` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
