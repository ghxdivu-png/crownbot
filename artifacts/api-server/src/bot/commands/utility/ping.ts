import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Colors } from "../../utils/embeds.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Check the bot's latency and API response time");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const sent = await interaction.reply({ content: "Pinging...", fetchReply: true });
  const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
  const ws = interaction.client.ws.ping;

  const embed = new EmbedBuilder()
    .setColor(Colors.info as number)
    .setTitle("🏓 Pong!")
    .addFields(
      { name: "Roundtrip Latency", value: `${roundtrip}ms`, inline: true },
      { name: "WebSocket Heartbeat", value: `${ws}ms`, inline: true }
    )
    .setTimestamp();

  await interaction.editReply({ content: "", embeds: [embed] });
}
