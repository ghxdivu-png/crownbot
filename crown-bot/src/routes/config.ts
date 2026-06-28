import { Router, type IRouter } from "express";

const router: IRouter = Router();

// Config requires a database — not available without persistent storage
router.get("/config", (_req, res): void => {
  res.status(501).json({ error: "Config storage requires a database." });
});

router.post("/config", (_req, res): void => {
  res.status(501).json({ error: "Config storage requires a database." });
});

export default router;
