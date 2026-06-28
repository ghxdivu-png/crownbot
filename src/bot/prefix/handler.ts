import { Message } from "discord.js";
import { errorEmbed } from "./embeds.js";
import { runModCommand } from "./mod.js";
import { runFunCommand } from "./fun.js";
import { runUtilityCommand } from "./utility.js";
import { runLevelingCommand } from "./leveling.js";
import { runAICommand } from "./ai.js";
import { runSettingsCommand } from "./settings.js";

export const PREFIX = ">";

export async function handlePrefix(message: Message): Promise<void> {
  if (!message.content.startsWith(PREFIX) || message.author.bot || !message.guild) return;
  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift()!.toLowerCase();

  try {
    // Route to the right module
    if (await runModCommand(command, args, message)) return;
    if (await runFunCommand(command, args, message)) return;
    if (await runUtilityCommand(command, args, message)) return;
    if (await runLevelingCommand(command, args, message)) return;
    if (await runAICommand(command, args, message)) return;
    if (await runSettingsCommand(command, args, message)) return;
  } catch (err) {
    await message.reply({ embeds: [errorEmbed("Something went wrong! Try again.")] }).catch(() => {});
  }
}
