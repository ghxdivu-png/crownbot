import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("reverse")
  .setDescription("Reverse any text")
  .addStringOption((opt) =>
    opt.setName("text").setDescription("Text to reverse").setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const text = interaction.options.getString("text", true);
  const reversed = text.split("").reverse().join("");

  const embed = new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle("🔄 Text Reversed")
    .addFields(
      { name: "Original", value: text },
      { name: "Reversed", value: reversed }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
