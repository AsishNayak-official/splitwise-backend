import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/express';

const JWT_SECRET = process.env.JWT_SECRET!;

export function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: 'No token' });
  }

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Invalid auth header' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      id: string;
      name: string;
      email: string;
      upiId: string;
    };
    req.userId = payload.id;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
