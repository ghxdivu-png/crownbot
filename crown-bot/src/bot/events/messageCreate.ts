import { Events, Message, TextChannel } from "discord.js";
import { handlePrefix } from "../prefix/handler.js";
import { runAutomod } from "../prefix/automod.js";
import { addXP } from "../prefix/store.js";
import { embed } from "../prefix/embeds.js";

export const name = Events.MessageCreate;
export const once = false;

export async function execute(message: Message): Promise<void> {
  if (message.author.bot || !message.guild) return;

  // 1. Run automod (bad words, anti-spam, anti-link)
  const blocked = await runAutomod(message);
  if (blocked) return;

  // 2. Award XP for chatting
  const xpResult = addXP(message.guild.id, message.author.id);
  if (xpResult?.leveled) {
    const lvlUp = await (message.channel as TextChannel).send({
      embeds: [embed({
        description: `🎉 ${message.author} leveled up to **Level ${xpResult.level}**! Keep chatting! 🔥`,
        color: 0xFEE75C,
      })],
    }).catch(() => null);
    if (lvlUp) setTimeout(() => lvlUp.delete().catch(() => {}), 8000);
  }

  // 3. Handle prefix commands
  await handlePrefix(message);
}
