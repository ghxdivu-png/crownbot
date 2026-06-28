import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("choose")
  .setDescription("Let the bot choose between options (separate with commas)")
  .addStringOption((opt) =>
    opt.setName("options").setDescription("Options separated by commas, e.g. pizza, tacos, sushi").setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const raw = interaction.options.getString("options", true);
  const choices = raw.split(",").map((s) => s.trim()).filter(Boolean);

  if (choices.length < 2) {
    await interaction.reply({ content: "❌ Please provide at least 2 options separated by commas.", ephemeral: true });
    return;
  }

  const chosen = choices[Math.floor(Math.random() * choices.length)];

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("🤔 I Choose...")
    .addFields(
      { name: "Options", value: choices.map((c, i) => `${i + 1}. ${c}`).join("\n") },
      { name: "My Pick", value: `✨ **${chosen}**` }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
