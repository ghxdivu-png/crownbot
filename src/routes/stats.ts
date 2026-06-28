import { Router, type IRouter } from "express";
import { getClient } from "../bot/bot.js";

const router: IRouter = Router();

router.get("/stats", async (req, res): Promise<void> => {
  const client = getClient();
  const { guildId } = req.query as Record<string, string | undefined>;

  if (!client || !guildId) {
    res.json({ totalWarnings: 0, activeTimeouts: 0, totalBans: 0, totalActions: 0, recentActions: [], actionBreakdown: [] });
    return;
  }

  try {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      res.json({ totalWarnings: 0, activeTimeouts: 0, totalBans: 0, totalActions: 0, recentActions: [], actionBreakdown: [] });
      return;
    }

    await guild.members.fetch();
    const activeTimeouts = guild.members.cache.filter((m) => m.isCommunicationDisabled()).size;

    res.json({
      totalWarnings: 0,
      activeTimeouts,
      totalBans: 0,
      totalActions: 0,
      recentActions: [],
      actionBreakdown: [],
    });
  } catch {
    res.json({ totalWarnings: 0, activeTimeouts: 0, totalBans: 0, totalActions: 0, recentActions: [], actionBreakdown: [] });
  }
});

export default router;
