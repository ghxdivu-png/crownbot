import {
  ChatInputCommandInteraction,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { errorEmbed } from "./embeds.js";

/**
 * Checks if the interaction user has mod/admin permissions.
 * Returns true if allowed, false (and replies with error) if not.
 */
export async function checkModPermission(
  interaction: ChatInputCommandInteraction
): Promise<boolean> {
  const member = interaction.member as GuildMember;
  if (
    !member.permissions.has(PermissionFlagsBits.ModerateMembers) &&
    !member.permissions.has(PermissionFlagsBits.Administrator)
  ) {
    await interaction.reply({
      embeds: [errorEmbed("No Permission", "You need the **Moderate Members** permission to use this command.")],
      ephemeral: true,
    });
    return false;
  }
  return true;
}

/**
 * Checks if the target member is protected (admin or owner).
 * Returns true if the action is allowed, false if the target is protected.
 */
export async function checkTargetVulnerable(
  interaction: ChatInputCommandInteraction,
  target: GuildMember
): Promise<boolean> {
  const guild = interaction.guild!;

  if (target.id === guild.ownerId) {
    await interaction.reply({
      embeds: [errorEmbed("Cannot Moderate", "You cannot moderate the server owner.")],
      ephemeral: true,
    });
    return false;
  }

  if (target.permissions.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      embeds: [errorEmbed("Cannot Moderate", "You cannot moderate an Administrator.")],
      ephemeral: true,
    });
    return false;
  }

  const botMember = guild.members.me!;
  if (target.roles.highest.position >= botMember.roles.highest.position) {
    await interaction.reply({
      embeds: [errorEmbed("Insufficient Bot Role", "My role is not high enough to moderate this user.")],
      ephemeral: true,
    });
    return false;
  }

  return true;
}
