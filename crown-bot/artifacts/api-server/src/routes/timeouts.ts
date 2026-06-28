import { Router, type IRouter } from "express";
import { getClient } from "../bot/bot.js";
import type { GuildMember, Snowflake, Collection } from "discord.js";

const router: IRouter = Router();

/** Paginated REST fetch — avoids opcode-8 gateway rate limit. */
async function fetchAllMembers(guild: Awaited<ReturnType<typeof import("discord.js").Client.prototype.guilds.fetch>>): Promise<Collection<Snowflake, GuildMember>> {
  const { Collection } = await import("discord.js");
  let all: Collection<Snowflake, GuildMember> = new Collection();
  let after: Snowflake = "0";

  while (true) {
    const batch: Collection<Snowflake, GuildMember> = await (guild as any).members.list({ limit: 1000, after });
    all = all.concat(batch);
    if (batch.size < 1000) break;
    after = (batch as Collection<Snowflake, GuildMember>).last()!.id;
  }

  return all;
}

router.get("/timeouts", async (req, res): Promise<void> => {
  const client = getClient();
  const { guildId } = req.query as Record<string, string | undefined>;

  if (!client || !guildId) { res.json([]); return; }

  try {
    const guild = await client.guilds.fetch(guildId);
    const allMembers = await (guild as any).members.list({ limit: 1000 }) as Collection<Snowflake, GuildMember>;
    const timedOut = allMembers.filter((m) => m.isCommunicationDisabled());

    res.json(timedOut.map((m) => ({
      id: m.id,
      userId: m.id,
      username: m.user.tag,
      guildId,
      expiresAt: m.communicationDisabledUntil!.toISOString(),
      createdAt: new Date().toISOString(),
      active: true,
    })));
  } catch {
    res.json([]);
  }
});

router.get("/timeouts/export", async (req, res): Promise<void> => {
  const client = getClient();
  const { guildId } = req.query as Record<string, string | undefined>;

  if (!client || !guildId) { res.status(400).json({ error: "Bot not ready or guildId missing" }); return; }

  try {
    const guild = await client.guilds.fetch(guildId);
    const allMembers = await (guild as any).members.list({ limit: 1000 }) as Collection<Snowflake, GuildMember>;
    const timedOut = allMembers.filter((m) => m.isCommunicationDisabled());

    const header = "User ID,Username,Expires At\n";
    const rows = timedOut.map((m) =>
      `${m.id},"${m.user.tag}",${m.communicationDisabledUntil!.toISOString()}`
    ).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="timeouts-${Date.now()}.csv"`);
    res.send(header + rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch timeouts" });
  }
});

router.get("/timeouts/info", async (req, res): Promise<void> => {
  const client = getClient();
  const { userId, guildId } = req.query as Record<string, string | undefined>;

  if (!userId || !guildId) { res.status(400).json({ error: "userId and guildId are required" }); return; }
  if (!client) { res.status(404).json({ error: "Bot not ready" }); return; }

  try {
    const guild = await client.guilds.fetch(guildId);
    const member = await (guild as any).members.fetch(userId) as GuildMember;
    if (!member?.isCommunicationDisabled()) { res.status(404).json({ error: "Not timed out" }); return; }

    res.json({
      id: member.id,
      userId: member.id,
      username: member.user.tag,
      guildId,
      expiresAt: member.communicationDisabledUntil!.toISOString(),
      active: true,
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch member" });
  }
});

export default router;
