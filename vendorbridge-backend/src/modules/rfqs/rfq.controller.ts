import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AppError } from '../../middleware/error.middleware';
import { createRfq, closeRfq, getRfqById, listRfqs, publishRfq } from './rfq.service';

export async function createRfqHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized', 401);
		}

		const data = await createRfq(req.body, req.user.id);
		res.status(201).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function listRfqHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		const data = await listRfqs(req.query as Record<string, string>);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function getRfqHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		const data = await getRfqById(req.params.id);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function publishRfqHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized', 401);
		}

		const data = await publishRfq(req.params.id, req.user.id);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function closeRfqHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized', 401);
		}

		const data = await closeRfq(req.params.id, req.user.id);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}
