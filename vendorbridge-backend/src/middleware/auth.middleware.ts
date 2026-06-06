import { NextFunction, Response } from 'express';
import { verifyToken } from '../lib/jwt';
import { AppError } from './error.middleware';
import { AuthenticatedRequest, AuthUser } from '../types';

export type AuthRequest = AuthenticatedRequest;

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
	try {
		const header = req.headers.authorization;
		const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

		if (!token) {
			throw new AppError('No token provided', 401);
		}

		const decoded = verifyToken(token) as AuthUser;
		req.user = decoded;
		next();
	} catch {
		next(new AppError('Invalid or expired token', 401));
	}
}
