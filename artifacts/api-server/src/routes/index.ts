import "dotenv/config";
import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiSearchRouter from "./ai-search";
import pushRouter from "./push";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aiSearchRouter);
router.use(pushRouter);

export default router;