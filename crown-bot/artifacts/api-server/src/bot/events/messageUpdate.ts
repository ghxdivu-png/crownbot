import { Events, Message, PartialMessage, TextChannel } from "discord.js";
import { getSettings } from "../prefix/store.js";
import { embed } from "../prefix/embeds.js";

export const name = Events.MessageUpdate;
export const once = false;

export async function execute(oldMsg: Message | PartialMessage, newMsg: Message | PartialMessage): Promise<void> {
  if (!newMsg.guild || newMsg.author?.bot) return;
  if (oldMsg.content === newMsg.content) return; // embed-only update, skip

  const settings = getSettings(newMsg.guild.id);
  if (!settings.modLogChannel) return;

  const ch = newMsg.guild.channels.cache.get(settings.modLogChannel);
  if (!ch || !(ch instanceof TextChannel)) return;

  await ch.send({
    embeds: [embed({
      title: "✏️ Message Edited",
      color: 0xFEE75C,
      fields: [
        { name: "Author", value: `${newMsg.author} (${newMsg.author?.tag})`, inline: true },
        { name: "Channel", value: `${newMsg.channel}`, inline: true },
        { name: "Before", value: (oldMsg.content ?? "Unknown").slice(0, 1000) || "*empty*", inline: false },
        { name: "After", value: (newMsg.content ?? "Unknown").slice(0, 1000) || "*empty*", inline: false },
        { name: "Jump", value: `[View Message](${newMsg.url})`, inline: true },
      ],
    })],
  }).catch(() => {});
}
