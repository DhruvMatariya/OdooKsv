import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { getAnalytics } from './analytics.service';

export async function getAnalyticsHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const period = Number(req.query.period ?? 30);
    const data = await getAnalytics(Number.isFinite(period) ? period : 30);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
