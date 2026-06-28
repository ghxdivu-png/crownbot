import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import timeoutsRouter from "./timeouts.js";
import warningsRouter from "./warnings.js";
import logsRouter from "./logs.js";
import statsRouter from "./stats.js";
import configRouter from "./config.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(timeoutsRouter);
router.use(warningsRouter);
router.use(logsRouter);
router.use(statsRouter);
router.use(configRouter);

export default router;
