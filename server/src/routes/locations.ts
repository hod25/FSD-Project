import { Router } from "express";
import locationController from "../controllers/locationController";

const router = Router();

router.post("/", locationController.createLocation);
router.post("/add-area", locationController.addAreaToLocation);
router.post("/remove-area", locationController.removeAreaFromLocation);
router.get("/:locationId", locationController.getLocationNameById);
router.get("/:locationId/areas", locationController.getAreaNamesByLocationId);

export default router;
