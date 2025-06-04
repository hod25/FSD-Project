import { Request, Response } from "express";
import LocationModel from "../models/Location";
import AreaModel from "../models/Area";

export const createLocation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ message: "Location name is required" });
      return;
    }

    const newLocation = await LocationModel.create({
      name,
      areas: [],
    });

    res.status(201).json({
      message: "Location created successfully",
      location: newLocation,
    });
  } catch (error) {
    console.error("Error creating location:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addAreaToLocation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { locationId, areaId } = req.body;

    if (!locationId || !areaId) {
      res.status(400).json({ message: "Missing locationId or areaId" });
      return;
    }

    const areaExists = await AreaModel.findById(areaId);
    if (!areaExists) {
      res.status(404).json({ message: "Area not found" });
      return;
    }

    const updatedLocation = await LocationModel.findByIdAndUpdate(
      locationId,
      { $addToSet: { areas: areaId } },
      { new: true }
    ).populate("areas");

    if (!updatedLocation) {
      res.status(404).json({ message: "Location not found" });
      return;
    }

    res.status(200).json({
      message: "Area added to location successfully",
      location: updatedLocation,
    });
  } catch (error) {
    console.error("Error adding area to location:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const removeAreaFromLocation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { locationId, areaId } = req.body;

  try {
    const location = await LocationModel.findById(locationId);

    if (!location) {
      res.status(404).json({ message: "Location not found" });
      return;
    }
    location.areas = location.areas.filter(
      (area: any) => area.toString() !== areaId.toString()
    );

    await location.save();

    res.status(200).json({ message: "Area removed successfully" });
  } catch (error) {
    console.error("Error removing area from location:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// ✅ פונקציה שמחזירה שם location לפי ID
export const getLocationNameById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { locationId } = req.params;

    if (!locationId) {
      res.status(400).json({ message: "Missing locationId parameter" });
      return;
    }

    const location = await LocationModel.findById(locationId);

    if (!location) {
      res.status(404).json({ message: "Location not found" });
      return;
    }

    res.status(200).json({ name: location.name });
  } catch (error) {
    console.error("Error fetching location name:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAreaNamesByLocationId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { locationId } = req.params;

    if (!locationId) {
      res.status(400).json({ message: "Missing locationId parameter" });
      return;
    }

    const location = await LocationModel.findById(locationId).populate("areas");

    if (!location) {
      res.status(404).json({ message: "Location not found" });
      return;
    }

    res.status(200).json({ areas: location.areas });
  } catch (error) {
    console.error("Error fetching areas for location:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default {
  createLocation,
  addAreaToLocation,
  removeAreaFromLocation,
  getLocationNameById,
  getAreaNamesByLocationId,
};
