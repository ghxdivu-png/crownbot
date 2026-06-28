import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { checkModPermission } from "../../utils/permissions.js";
import { errorEmbed } from "../../utils/embeds.js";

export const data = new SlashCommandBuilder()
  .setName("warnings")
  .setDescription("View warnings for a member")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((opt) =>
    opt.setName("user").setDescription("The user to check").setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!await checkModPermission(interaction)) return;
  await interaction.reply({
    embeds: [errorEmbed("No Database", "Warning history requires a database. This bot runs without persistent storage.")],
    ephemeral: true,
  });
}
