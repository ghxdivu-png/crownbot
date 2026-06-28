import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Colors } from "../../utils/embeds.js";

export const data = new SlashCommandBuilder()
  .setName("membercount")
  .setDescription("Show the member count for this server");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const guild = interaction.guild!;
  await guild.fetch();
  const humans = guild.members.cache.filter((m) => !m.user.bot).size;
  const bots = guild.members.cache.filter((m) => m.user.bot).size;

  const embed = new EmbedBuilder()
    .setColor(Colors.info as number)
    .setTitle(`${guild.name} — Member Count`)
    .setThumbnail(guild.iconURL())
    .addFields(
      { name: "Total Members", value: guild.memberCount.toString(), inline: true },
      { name: "Humans", value: humans.toString(), inline: true },
      { name: "Bots", value: bots.toString(), inline: true },
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
