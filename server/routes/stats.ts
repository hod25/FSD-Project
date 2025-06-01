import { Router } from "express";
import { getNoHardHatStats } from "../controllers/statsController";

const router = Router();

router.post("/no-hardhat", getNoHardHatStats);

export default router;
