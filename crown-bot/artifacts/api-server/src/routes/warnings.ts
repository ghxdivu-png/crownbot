import { Router, type IRouter } from "express";

const router: IRouter = Router();

// No database — warnings are not persisted
router.get("/warnings", (_req, res): void => {
  res.json([]);
});

export default router;
