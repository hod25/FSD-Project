import { Router } from "express";
import locationController from "../controllers/locationController";

const router = Router();

router.post("/", locationController.createLocation);
router.post("/add-area", locationController.addAreaToLocation);
router.post("/remove-area", locationController.removeAreaFromLocation);
router.get("/:locationId/areas", locationController.getAreaNamesByLocationId);
router.get("/:locationId", locationController.getLocationNameById); 

export default router;
