import { Request, Response } from "express";
import {
  getTotalEvents,
  getTotalViolations,
  getEventsByDate,
  getStatusCounts,
  getEventsByLocation,
  getEventsByArea,
  getEventsByDateStatus,
  getEventsByLocationStatus,
  getEventsByAreaStatus,
} from "../utils/index";

export const getNoHardHatStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filters = req.body;

    const [
      totalEvents,
      totalViolations,
      eventsByDate,
      statusCounts,
      eventsByLocation,
      eventsByArea,
      eventsByDateStatus,
      eventsByLocationStatus,
      eventsByAreaStatus,
    ] = await Promise.all([
      getTotalEvents(filters),
      getTotalViolations(filters),
      getEventsByDate(filters),
      getStatusCounts(filters),
      getEventsByLocation(filters),
      getEventsByArea(filters),
      getEventsByDateStatus(filters),
      getEventsByLocationStatus(filters),
      getEventsByAreaStatus(filters),
    ]);

    const avgViolationsPerEvent =
      totalEvents > 0 ? totalViolations / totalEvents : 0;

    res.json({
      totalEvents,
      totalViolations,
      avgViolationsPerEvent,
      eventsByDate,
      statusCounts,
      eventsByLocation,
      eventsByArea,
      eventsByDateStatus,
      eventsByLocationStatus,
      eventsByAreaStatus,
    });
  } catch (error) {
    console.error("Error in getNoHardHatStats:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
