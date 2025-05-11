import { Request, Response } from 'express';
import userModel from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

type tTokens = {
  accessToken: string;
  refreshToken: string;
};


const generateToken = (userId: string): tTokens | null => {
  if (!process.env.TOKEN_SECRET) return null;

  const random = Math.random().toString();

  const accessToken = jwt.sign(
    { _id: userId, random },
    process.env.TOKEN_SECRET,
    { expiresIn: 5000 }
  );

  const refreshToken = jwt.sign(
    { _id: userId, random },
    process.env.TOKEN_SECRET,
    { expiresIn: 1000 }
  );

  return { accessToken, refreshToken };
};

export const login = async (req: Request, res: Response): Promise<void> => {

  try {
    const { email, password } = req.body;
    console.log(email);
    console.log(password)

    const user = await userModel.findOne({ email });
    console.log(user)
    if (!user) {
      res.status(400).json({ message: 'Wrong email or password' });
      return;
    }
    console.log(user.password)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: 'Wrong email or password' });
      return;
    }

    const tokens = generateToken(user._id);
    if (!tokens) {
      res.status(500).json({ message: 'Token generation failed' });
      return;
    }

    user.refreshToken = user.refreshToken || [];
    user.refreshToken.push(tokens.refreshToken);
    await user.save();

    res.status(200).json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
export default {
    login,
};