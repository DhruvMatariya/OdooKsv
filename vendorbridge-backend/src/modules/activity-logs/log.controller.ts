import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { listActivityLogs } from './log.service';

export async function getLogsHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		const data = await listActivityLogs(req.query as Record<string, string>);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}
