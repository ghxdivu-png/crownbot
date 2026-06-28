import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, Role } from "discord.js";
import { Colors } from "../../utils/embeds.js";

export const data = new SlashCommandBuilder()
  .setName("roleinfo")
  .setDescription("Display information about a role")
  .addRoleOption((opt) =>
    opt.setName("role").setDescription("The role to look up").setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const rawRole = interaction.options.getRole("role", true);
  // Fetch full Role object to access all properties
  const role = rawRole instanceof Role ? rawRole : await interaction.guild!.roles.fetch(rawRole.id);
  if (!role) {
    await interaction.reply({ content: "Could not fetch role.", ephemeral: true });
    return;
  }
  const guild = interaction.guild!;
  const memberCount = guild.members.cache.filter((m) => m.roles.cache.has(role.id)).size;

  const embed = new EmbedBuilder()
    .setColor((role.color || Colors.neutral) as number)
    .setTitle(`Role: ${role.name}`)
    .addFields(
      { name: "Role ID", value: role.id, inline: true },
      { name: "Color", value: role.hexColor, inline: true },
      { name: "Mentionable", value: role.mentionable ? "Yes" : "No", inline: true },
      { name: "Hoisted", value: role.hoist ? "Yes" : "No", inline: true },
      { name: "Position", value: role.position.toString(), inline: true },
      { name: "Members", value: memberCount.toString(), inline: true },
      { name: "Created", value: `<t:${Math.floor(role.createdTimestamp / 1000)}:F>` },
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
