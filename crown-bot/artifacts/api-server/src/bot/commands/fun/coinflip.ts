import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("coinflip")
  .setDescription("Flip a coin — heads or tails");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const result = Math.random() < 0.5 ? "Heads" : "Tails";
  const embed = new EmbedBuilder()
    .setColor(result === "Heads" ? 0xfee75c : 0x57f287)
    .setTitle(`🪙 ${result}!`)
    .setDescription(`The coin landed on **${result}**!`)
    .setFooter({ text: `Flipped by ${interaction.user.tag}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
