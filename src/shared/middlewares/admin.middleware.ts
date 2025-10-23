import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin, AdminJwtPayload } from '@modules/users/domain/admin.entity';

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