import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AdminJwtPayload } from '@modules/users/domain/admin.entity';

const JWT_SECRET = process.env.JWT_SECRET || '123';

export function adminMiddleware(req: Request, res: Response, next: NextFunction): void {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		res.status(401).json({ message: 'No token provided' });
		return;
	}
	const token = authHeader.split(' ')[1];
	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		if (typeof decoded === 'object' && decoded !== null) {
			(req as Request & { admin?: AdminJwtPayload }).admin = decoded as AdminJwtPayload;
			next();
		} else {
			res.status(401).json({ message: 'Invalid token payload' });
			return;
		}
	} catch {
		res.status(401).json({ message: 'Invalid token' });
		return;
	}
}

export function requireAdminLevel(level: 'full' | 'partial' | 'any' = 'any') {
  return (req: Request & { admin?: AdminJwtPayload }, res: Response, next: NextFunction): void => {
    adminMiddleware(req, res, () => {
      const current = req.admin;
      if (!current) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      if (level === 'any') return next();
      const al = current.accessLevel || 'full';
      if (level === 'full' && al !== 'full') {
        res.status(403).json({ message: 'Forbidden: full access required' });
        return;
      }
      return next();
    });
  };
}