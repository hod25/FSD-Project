import { Router } from "express";
import userController from "../controllers/userController"; 

const router = Router();
// עדכון פרופיל לפי ID
router.put("/:id", userController.updateProfile);
// שליפת פרטי משתמש לפי ID
router.get("/:id", userController.getUserById); 

router.get("/", userController.getUsersBySiteLocation);

router.delete("/:id", userController.deleteUser);

export default router;
