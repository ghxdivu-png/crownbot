import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("dog")
  .setDescription("Get a random dog image 🐶");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  try {
    const res = await fetch("https://dog.ceo/api/breeds/image/random");
    const data = await res.json() as { message: string };

    const embed = new EmbedBuilder()
      .setColor(0x78e08f)
      .setTitle("🐶 Random Dog!")
      .setImage(data.message)
      .setFooter({ text: "Powered by dog.ceo" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch {
    await interaction.editReply({ content: "🐕 Couldn't fetch a dog right now. Try again!" });
  }
}
