import { NextFunction, Response } from 'express';
import { UserRole } from '@prisma/client';
import { AuthRequest } from './auth.middleware';
import { AppError } from './error.middleware';

export function authorize(...roles: UserRole[]) {
	return (req: AuthRequest, res: Response, next: NextFunction): void => {
		if (!req.user || !roles.includes(req.user.role)) {
			next(new AppError('Forbidden: insufficient permissions', 403));
			return;
		}

		next();
	};
}
