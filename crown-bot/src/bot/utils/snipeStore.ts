import type { Message } from "discord.js";

interface SnipedMessage {
  content: string;
  authorId: string;
  authorTag: string;
  authorAvatar: string | null;
  deletedAt: Date;
}

// In-memory store: channelId -> last deleted message
const snipeCache = new Map<string, SnipedMessage>();

export function storeDeletedMessage(message: Message): void {
  if (message.partial || message.author.bot) return;
  snipeCache.set(message.channelId, {
    content: message.content || "[no text content]",
    authorId: message.author.id,
    authorTag: message.author.tag,
    authorAvatar: message.author.displayAvatarURL(),
    deletedAt: new Date(),
  });
}

export function getSniped(channelId: string): SnipedMessage | undefined {
  return snipeCache.get(channelId);
}
