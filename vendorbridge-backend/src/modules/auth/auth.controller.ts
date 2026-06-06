import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AppError } from '../../middleware/error.middleware';
import { getCurrentUser, loginUser, registerUser } from './auth.service';

export async function register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		const data = await registerUser(req.body);
		res.status(201).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		const data = await loginUser(req.body);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized', 401);
		}

		const data = await getCurrentUser(req.user.id);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}
