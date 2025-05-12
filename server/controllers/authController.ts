import { Request, Response } from "express";
import userModel from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateToken = (userId: string): string | null => {
  if (!process.env.TOKEN_SECRET) return null;

  const token = jwt.sign({ _id: userId }, process.env.TOKEN_SECRET, {
    expiresIn: "12h",
  });

  return token;
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, site_location } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
      site_location,
      access_level: "viewer",
    });

    const token = generateToken(newUser._id.toString());
    if (!token) {
      res.status(500).json({ message: "Token generation failed" });
      return;
    }

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 12 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        access_level: newUser.access_level,
        site_location: newUser.site_location,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Wrong email or password" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: "Wrong email or password" });
      return;
    }

    const token = generateToken(user._id.toString());
    if (!token) {
      res.status(500).json({ message: "Token generation failed" });
      return;
    }

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 12 * 60 * 60 * 1000,
    });

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        access_level: user.access_level,
        site_location: user.site_location,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default {
  login,
  register,
};
