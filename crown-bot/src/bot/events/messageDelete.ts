import { Events, Message, PartialMessage, TextChannel } from "discord.js";
import { storeDeletedMessage } from "../utils/snipeStore.js";
import { getSettings } from "../prefix/store.js";
import { embed } from "../prefix/embeds.js";

export const name = Events.MessageDelete;
export const once = false;

export async function execute(message: Message | PartialMessage): Promise<void> {
  // Store for snipe command
  if (!message.partial) storeDeletedMessage(message as Message);

  // Log to mod log
  if (!message.guild || message.author?.bot) return;
  const settings = getSettings(message.guild.id);
  if (!settings.modLogChannel) return;

  const ch = message.guild.channels.cache.get(settings.modLogChannel);
  if (!ch || !(ch instanceof TextChannel)) return;

  await ch.send({
    embeds: [embed({
      title: "🗑️ Message Deleted",
      color: 0xED4245,
      fields: [
        { name: "Author", value: message.author ? `${message.author} (${message.author.tag})` : "Unknown", inline: true },
        { name: "Channel", value: `${message.channel}`, inline: true },
        { name: "Content", value: (message.content ?? "Unknown/Cached message").slice(0, 1000) || "*empty*", inline: false },
      ],
    })],
  }).catch(() => {});
}
