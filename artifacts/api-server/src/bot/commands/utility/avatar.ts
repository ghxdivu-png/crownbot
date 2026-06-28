import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Colors } from "../../utils/embeds.js";

export const data = new SlashCommandBuilder()
  .setName("avatar")
  .setDescription("Show a user's avatar")
  .addUserOption((opt) =>
    opt.setName("user").setDescription("The user whose avatar to show").setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const target = interaction.options.getUser("user") ?? interaction.user;

  const embed = new EmbedBuilder()
    .setColor(Colors.info as number)
    .setTitle(`${target.tag}'s Avatar`)
    .setImage(target.displayAvatarURL({ size: 512 }))
    .addFields(
      { name: "PNG", value: `[Link](${target.displayAvatarURL({ extension: "png", size: 512 })})`, inline: true },
      { name: "WebP", value: `[Link](${target.displayAvatarURL({ extension: "webp", size: 512 })})`, inline: true },
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
