import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { AuthRequest } from '../types/express';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '7d';

function createToken(user: IUser): string {
  return jwt.sign(
    {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      upiId: user.upiId,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, upiId, password } = req.body as {
      name: string;
      email: string;
      upiId: string;
      password: string;
    };

    if (!name || !email || !upiId || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    let user = await User.findOne({ email, upiId });

    const passwordHash = await bcrypt.hash(password, 10);

    if (!user) {
      user = await User.create({
        name,
        email,
        upiId,
        passwordHash,
      });
    } else {
      // If user already exists with same email+upi, update password & name
      user.name = name;
      user.passwordHash = passwordHash;
      await user.save();
    }

    const token = createToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        upiId: user.upiId,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Signup failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.lastActiveAt = new Date();
    await user.save();

    const token = createToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        upiId: user.upiId,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};
