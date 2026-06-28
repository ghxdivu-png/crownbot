import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("dice")
  .setDescription("Roll one or more dice")
  .addIntegerOption((opt) =>
    opt.setName("sides").setDescription("Number of sides (default: 6)").setMinValue(2).setMaxValue(1000)
  )
  .addIntegerOption((opt) =>
    opt.setName("count").setDescription("Number of dice to roll (default: 1)").setMinValue(1).setMaxValue(20)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const sides = interaction.options.getInteger("sides") ?? 6;
  const count = interaction.options.getInteger("count") ?? 1;

  const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
  const total = rolls.reduce((a, b) => a + b, 0);

  const embed = new EmbedBuilder()
    .setColor(0xe67e22)
    .setTitle(`🎲 Dice Roll — ${count}d${sides}`)
    .addFields(
      { name: "Rolls", value: rolls.map((r) => `**${r}**`).join("  "), inline: true },
      { name: "Total", value: `**${total}**`, inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
