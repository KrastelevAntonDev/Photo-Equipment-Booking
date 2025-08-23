import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserJwtPayload } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // res.status(401).json({ message: 'No token provided' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'object' && decoded !== null) {
      (req as Request & { user?: UserJwtPayload }).user = decoded as UserJwtPayload;
      next();
    } else {
      res.status(401).json({ message: 'Invalid token payload' });
      return;
    }
  } catch {
    // res.status(401).json({ message: 'Invalid token' });
    return;
  }
}