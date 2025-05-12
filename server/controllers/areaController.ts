import { Request, Response } from "express";
import AreaModel from "../models/Area";

export const createArea = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, url } = req.body;

    if (!name || !url) {
      res.status(400).json({ message: "Missing name or url" });
      return;
    }

    const newArea = await AreaModel.create({ name, url });

    res.status(201).json({
      message: "Area created successfully",
      area: newArea,
    });
  } catch (error) {
    console.error("Error creating area:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default {
  createArea,
};
