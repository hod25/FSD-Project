import { Request, Response } from "express";
import AreaModel, { IArea } from "../models/Area";

export const createArea = async (req: Request, res: Response) => {
  try {
    const { name, url } = req.body;

    if (!name || !url) {
      return res.status(400).json({ message: "Missing name or url" });
    }

    const newArea: IArea = await AreaModel.create({ name, url });
    res.status(201).json({ message: "Area created", area: newArea });
  } catch (error) {
    console.error("❌ Error creating area:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllAreas = async (_req: Request, res: Response) => {
  try {
    const areas: IArea[] = await AreaModel.find();
    res.status(200).json(areas);
  } catch (error) {
    console.error("❌ Error fetching areas:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAreaById = async (req: Request, res: Response) => {
  try {
    const area = await AreaModel.findById(req.params.id);
    if (!area) return res.status(404).json({ message: "Area not found" });
    res.status(200).json(area);
  } catch (error) {
    console.error("❌ Error fetching area by ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateArea = async (req: Request, res: Response) => {
  try {
    const area = await AreaModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!area) return res.status(404).json({ message: "Area not found" });
    res.status(200).json({ message: "Area updated", area });
  } catch (error) {
    console.error("❌ Error updating area:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteArea = async (req: Request, res: Response) => {
  try {
    const area = await AreaModel.findByIdAndDelete(req.params.id);
    if (!area) return res.status(404).json({ message: "Area not found" });
    res.status(200).json({ message: "Area deleted" });
  } catch (error) {
    console.error("❌ Error deleting area:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export default {
  createArea,
  getAllAreas,
  getAreaById,
  updateArea,
  deleteArea,
};
