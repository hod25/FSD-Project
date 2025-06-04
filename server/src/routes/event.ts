import { Router } from "express";
import {
  createEvent,
  getAllEvents,
  getEventsByArea,
  updateEventStatus,
} from "../controllers/eventController";

const router = Router();

router.post("/", createEvent); // create a new event
router.get("/", getAllEvents); // get all events
router.get("/area/:areaId", getEventsByArea); // get events by area

router.patch("/status/:eventId", updateEventStatus);

export default router;
