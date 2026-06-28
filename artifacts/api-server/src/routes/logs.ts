import { Router, type IRouter } from "express";

const router: IRouter = Router();

// No database — mod logs are not persisted
router.get("/logs", (_req, res): void => {
  res.json([]);
});

export default router;
