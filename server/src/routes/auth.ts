import { Router, Request, Response } from "express";
import authController from "../controllers/authController";

const router = Router();
router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authController.logout);

export default router;
