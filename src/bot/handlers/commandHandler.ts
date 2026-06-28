import { Client, Collection } from "discord.js";
import { logger } from "../../lib/logger.js";

// ── Moderation ────────────────────────────────────────────────────────────────
import * as ban from "../commands/moderation/ban.js";
import * as unban from "../commands/moderation/unban.js";
import * as kick from "../commands/moderation/kick.js";
import * as timeout from "../commands/moderation/timeout.js";
import * as untimeout from "../commands/moderation/untimeout.js";
import * as warn from "../commands/moderation/warn.js";
import * as warnings from "../commands/moderation/warnings.js";
import * as clear from "../commands/moderation/clear.js";
import * as lock from "../commands/moderation/lock.js";
import * as unlock from "../commands/moderation/unlock.js";
import * as slowmode from "../commands/moderation/slowmode.js";
import * as softban from "../commands/moderation/softban.js";
import * as hackban from "../commands/moderation/hackban.js";
import * as nuke from "../commands/moderation/nuke.js";
import * as announce from "../commands/moderation/announce.js";

// ── Utility ───────────────────────────────────────────────────────────────────
import * as ping from "../commands/utility/ping.js";
import * as serverinfo from "../commands/utility/serverinfo.js";
import * as userinfo from "../commands/utility/userinfo.js";
import * as avatar from "../commands/utility/avatar.js";
import * as roleinfo from "../commands/utility/roleinfo.js";
import * as membercount from "../commands/utility/membercount.js";
import * as poll from "../commands/utility/poll.js";
import * as botinfo from "../commands/utility/botinfo.js";
import * as uptime from "../commands/utility/uptime.js";
import * as invite from "../commands/utility/invite.js";
import * as channelinfo from "../commands/utility/channelinfo.js";
import * as embed from "../commands/utility/embed.js";
import * as snipe from "../commands/utility/snipe.js";

// ── Fun ───────────────────────────────────────────────────────────────────────
import * as eightball from "../commands/fun/8ball.js";
import * as coinflip from "../commands/fun/coinflip.js";
import * as dice from "../commands/fun/dice.js";
import * as joke from "../commands/fun/joke.js";
import * as rps from "../commands/fun/rps.js";
import * as choose from "../commands/fun/choose.js";
import * as reverse from "../commands/fun/reverse.js";
import * as say from "../commands/fun/say.js";
import * as quote from "../commands/fun/quote.js";
import * as cat from "../commands/fun/cat.js";
import * as dog from "../commands/fun/dog.js";
import * as meme from "../commands/fun/meme.js";

// ── Games ─────────────────────────────────────────────────────────────────────
import * as trivia from "../commands/games/trivia.js";
import * as math from "../commands/games/math.js";
import * as hangman from "../commands/games/hangman.js";

// ── Timeouts ──────────────────────────────────────────────────────────────────
import * as timeouts from "../commands/timeout/timeouts.js";
import * as timeoutinfo from "../commands/timeout/timeoutinfo.js";

// ── Tickets ───────────────────────────────────────────────────────────────────
import * as ticketSetup from "../commands/tickets/ticket-setup.js";
import * as ticketManage from "../commands/tickets/ticket-manage.js";

// ── Roles ─────────────────────────────────────────────────────────────────────
import * as reactionrole from "../commands/roles/reactionrole.js";

// ── Suggestions ───────────────────────────────────────────────────────────────
import * as suggest from "../commands/suggestions/suggest.js";
import * as suggestionManage from "../commands/suggestions/suggestion-manage.js";

// ── Config ────────────────────────────────────────────────────────────────────
import * as config from "../commands/config/config.js";
import * as schedule from "../commands/config/schedule.js";

// ── Admin ─────────────────────────────────────────────────────────────────────
import * as admin from "../commands/admin/admin.js";

const ALL_COMMANDS = [
  // Moderation
  ban, unban, kick, timeout, untimeout, warn, warnings,
  clear, lock, unlock, slowmode, softban, hackban, nuke, announce,
  // Utility
  ping, serverinfo, userinfo, avatar, roleinfo, membercount,
  poll, botinfo, uptime, invite, channelinfo, embed, snipe,
  // Fun
  eightball, coinflip, dice, joke, rps, choose, reverse, say, quote, cat, dog, meme,
  // Games
  trivia, math, hangman,
  // Timeouts
  timeouts, timeoutinfo,
  // Tickets
  ticketSetup, ticketManage,
  // Roles
  reactionrole,
  // Suggestions
  suggest, suggestionManage,
  // Config
  config, schedule,
  // Admin
  admin,
];

export interface BotCommand {
  data: { name: string; toJSON(): object };
  execute: (...args: any[]) => Promise<void>;
}

export function loadCommands(client: Client): Collection<string, BotCommand> {
  const commands = new Collection<string, BotCommand>();
  (client as any).commands = commands;
  for (const cmd of ALL_COMMANDS) {
    const command = cmd as unknown as BotCommand;
    if (!command.data || !command.execute) {
      logger.warn({ name: String(command.data?.name) }, "Command missing data or execute");
      continue;
    }
    commands.set(command.data.name, command);
    logger.debug({ name: command.data.name }, "Loaded command");
  }
  logger.info({ count: commands.size }, "All commands loaded");
  return commands;
}

export function getCommandsJSON(): object[] {
  return ALL_COMMANDS.map((cmd) => (cmd as unknown as BotCommand).data.toJSON());
}
