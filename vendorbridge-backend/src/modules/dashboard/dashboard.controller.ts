import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { getDashboardData } from './dashboard.service';

export async function getDashboardHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		const data = await getDashboardData(req.user!);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}
