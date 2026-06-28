import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("cat")
  .setDescription("Get a random cat image 🐱");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  try {
    const res = await fetch("https://api.thecatapi.com/v1/images/search");
    const [data] = await res.json() as { url: string }[];

    const embed = new EmbedBuilder()
      .setColor(0xff9f43)
      .setTitle("🐱 Random Cat!")
      .setImage(data.url)
      .setFooter({ text: "Powered by The Cat API" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch {
    await interaction.editReply({ content: "😿 Couldn't fetch a cat right now. Try again!" });
  }
}
