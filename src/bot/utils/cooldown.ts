import { ChatInputCommandInteraction } from "discord.js";
import { errorEmbed } from "./embeds.js";

// Map: commandName -> Map<userId, timestamp>
const cooldowns = new Map<string, Map<string, number>>();

/**
 * Checks cooldown for a command. Returns true if allowed, false if on cooldown.
 * Default cooldown is 3 seconds.
 */
export async function checkCooldown(
  interaction: ChatInputCommandInteraction,
  cooldownSeconds = 3
): Promise<boolean> {
  const commandName = interaction.commandName;
  const userId = interaction.user.id;

  if (!cooldowns.has(commandName)) {
    cooldowns.set(commandName, new Map());
  }

  const userCooldowns = cooldowns.get(commandName)!;
  const now = Date.now();
  const cooldownMs = cooldownSeconds * 1000;

  if (userCooldowns.has(userId)) {
    const lastUsed = userCooldowns.get(userId)!;
    const remaining = cooldownMs - (now - lastUsed);
    if (remaining > 0) {
      await interaction.reply({
        embeds: [errorEmbed("Cooldown", `Please wait **${(remaining / 1000).toFixed(1)}s** before using this command again.`)],
        ephemeral: true,
      });
      return false;
    }
  }

  userCooldowns.set(userId, now);
  // Auto-clear after cooldown expires to prevent memory leak
  setTimeout(() => userCooldowns.delete(userId), cooldownMs);

  return true;
}
