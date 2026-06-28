import { Client } from "discord.js";
import { logger } from "../../lib/logger.js";

import * as ready from "../events/ready.js";
import * as interactionCreate from "../events/interactionCreate.js";
import * as messageDelete from "../events/messageDelete.js";
import * as messageCreate from "../events/messageCreate.js";
import * as messageUpdate from "../events/messageUpdate.js";
import * as guildMemberAdd from "../events/guildMemberAdd.js";
import * as guildMemberRemove from "../events/guildMemberRemove.js";

const ALL_EVENTS = [
  ready,
  interactionCreate,
  messageCreate,
  messageDelete,
  messageUpdate,
  guildMemberAdd,
  guildMemberRemove,
];

export interface BotEvent {
  name: string;
  once: boolean;
  execute: (...args: any[]) => Promise<void>;
}

export function loadEvents(client: Client): void {
  for (const event of ALL_EVENTS) {
    const e = event as unknown as BotEvent;
    if (e.once) {
      client.once(e.name, (...args) => e.execute(...args));
    } else {
      client.on(e.name, (...args) => e.execute(...args));
    }
    logger.debug({ name: e.name, once: e.once }, "Registered event");
  }
  logger.info({ count: ALL_EVENTS.length }, "All events registered");
}
