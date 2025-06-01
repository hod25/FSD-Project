import areaController from "../controllers/areaController";

const router = require("express").Router();

router.post("/", areaController.createArea);
router.get("/", areaController.getAllAreas);
router.get("/:id", areaController.getAreaById);
router.put("/:id", areaController.updateArea);
router.delete("/:id", areaController.deleteArea);

export default router;
