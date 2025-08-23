<<<<<<< HEAD
import { Request, Response, NextFunction } from "express";
import userModel from "../models/User";
import bcrypt from "bcrypt";

// פונקציית עדכון פרופיל
const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, password } = req.body;

    if (!name && !email && !phone && !password) {
      res.status(400).json({ message: "No fields to update" });
      return;
    }

    const update: any = {};
    if (name) update.name = name;
    if (email) update.email = email;
    if (phone) update.phone = phone;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      update.password = hashedPassword;
    }

    const user = await userModel.findByIdAndUpdate(id, update, { new: true });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      access_level: user.access_level,
      site_location: user.site_location,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// שליפת משתמש לפי ID
const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await userModel.findById(id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      access_level: user.access_level,
      site_location: user.site_location,
    });
  } catch (err) {
    console.error("Get user by ID error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export default {
  updateProfile,
  getUserById
=======
import { Request, Response, NextFunction } from "express";
import userModel from "../models/User";
import bcrypt from "bcrypt";

// פונקציית עדכון פרופיל
const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, password } = req.body;

    if (!name && !email && !phone && !password) {
      res.status(400).json({ message: "No fields to update" });
      return;
    }

    const update: any = {};
    if (name) update.name = name;
    if (email) update.email = email;
    if (phone) update.phone = phone;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      update.password = hashedPassword;
    }

    const user = await userModel.findByIdAndUpdate(id, update, { new: true });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      access_level: user.access_level,
      site_location: user.site_location,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// שליפת משתמש לפי ID
const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await userModel.findById(id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      access_level: user.access_level,
      site_location: user.site_location,
    });
  } catch (err) {
    console.error("Get user by ID error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const getUsersBySiteLocation = async (req: Request, res: Response): Promise<void> => {
  const { site_location } = req.query;

  try {
    let users;
    if (site_location) {
      users = await userModel.find({ site_location });
    } else {
      users = await userModel.find(); // fallback to all users
    }

    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Failed to fetch users", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    await userModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    console.error("❌ Failed to delete user", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default {
  updateProfile,
  getUserById,
  getUsersBySiteLocation,
  deleteUser,
>>>>>>> f60cc7d (stablize system)
};