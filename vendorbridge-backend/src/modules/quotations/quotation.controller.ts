import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AppError } from '../../middleware/error.middleware';
import {
	compareQuotationsForRfq,
	createQuotation,
	listQuotationsForRfq,
	listMyQuotations,
	updateQuotation,
} from './quotation.service';

export async function createQuotationHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized', 401);
		}

		const data = await createQuotation(req.params.rfqId, req.user.id, req.body);
		res.status(201).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function listQuotationsHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		const data = await listQuotationsForRfq(req.params.rfqId);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function listMyQuotationsHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized', 401);
		}
		const data = await listMyQuotations(req.user.id);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function compareQuotationsHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		const data = await compareQuotationsForRfq(req.params.rfqId);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function updateQuotationHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized', 401);
		}

		const data = await updateQuotation(req.params.id, req.user.id, req.body);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}
