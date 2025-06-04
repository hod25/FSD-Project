// controllers/eventController.ts
import { Request, Response } from "express";
import EventModel from "../models/Event";

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      site_location,
      area_location,
      details,
      image_url,
      time_,
      no_hardhat_count, 
    } = req.body;

    if (!site_location || !area_location || !details || !image_url || !time_) {
      res.status(400).json({ message: "Missing required event fields" });
      return;
    }

    console.log("📥 Received event with no_hardhat_count:", no_hardhat_count);
    console.log("📥 Count received from Python:", req.body.no_hardhat_count);


    const newEvent = await EventModel.create({
      site_location,
      area_location,
      status: "Open",
      details,
      image_url,
      time_,
        no_hardhat_count: Number(req.body.no_hardhat_count),
    });

    

    console.log("✅ Event saved:", newEvent._id);
    res.status(201).json({ message: "Event created", event: newEvent });
  } catch (error) {
    console.error("❌ Error creating event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllEvents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const events = await EventModel.find().sort({ time_: -1 });
    res.status(200).json(events);
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// בקונטרולר eventController.ts
export const getEventsByArea = async (req: Request, res: Response): Promise<void> => {
  try {
    const { areaId } = req.params;

    if (!areaId) {
      res.status(400).json({ message: "Missing area ID" });
      return;
    }

    const events = await EventModel.find({ area_location: areaId }).sort({ time_: -1 });

    res.status(200).json(events);
  } catch (error) {
    console.error("❌ Error fetching events by area:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateEventStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { status } = req.body;

    if (!eventId) {
      res.status(400).json({ message: "Missing event ID" });
      return;
    }

    const updated = await EventModel.findByIdAndUpdate(
      eventId,
      { status },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    res.status(200).json({ message: "Event status updated", event: updated });
  } catch (error) {
    console.error("❌ Error updating event status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
