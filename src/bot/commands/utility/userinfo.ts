import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { Colors } from "../../utils/embeds.js";

export const data = new SlashCommandBuilder()
  .setName("userinfo")
  .setDescription("Display information about a user")
  .addUserOption((opt) =>
    opt.setName("user").setDescription("The user to look up (defaults to yourself)").setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const target = (interaction.options.getMember("user") as GuildMember | null) ?? (interaction.member as GuildMember);
  const user = target.user;

  const roles = target.roles.cache
    .filter((r) => r.id !== interaction.guildId)
    .sort((a, b) => b.position - a.position)
    .map((r) => `<@&${r.id}>`)
    .slice(0, 10)
    .join(", ") || "None";

  const embed = new EmbedBuilder()
    .setColor(target.displayHexColor || (Colors.info as unknown as `#${string}`))
    .setTitle(user.tag)
    .setThumbnail(user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: "User ID", value: user.id, inline: true },
      { name: "Nickname", value: target.nickname ?? "None", inline: true },
      { name: "Bot", value: user.bot ? "Yes" : "No", inline: true },
      { name: "Joined Server", value: `<t:${Math.floor((target.joinedTimestamp ?? 0) / 1000)}:F>`, inline: true },
      { name: "Account Created", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true },
      { name: `Roles (${target.roles.cache.size - 1})`, value: roles },
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
