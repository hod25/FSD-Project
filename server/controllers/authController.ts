import { Request, Response } from 'express';
import userModel from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

type tTokens = {
  accessToken: string;
  refreshToken: string;
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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
        expiresIn: "12h",
      });
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 12 * 60 * 60 * 1000,
        sameSite: "lax",            
        secure: false, 
      });
    
       res.json({ message: "Login successful" });

   
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
export default {
    login,
};