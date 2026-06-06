import { PurchaseOrderStatus } from '@prisma/client';
import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AppError } from '../../middleware/error.middleware';
import { createPurchaseOrder, getPurchaseOrderById, listPurchaseOrders, updatePurchaseOrderStatus } from './po.service';

export async function createPurchaseOrderHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized', 401);
		}

		const data = await createPurchaseOrder(req.body, req.user.id);
		res.status(201).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function listPurchaseOrdersHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.user) throw new AppError('Unauthorized', 401);
		const data = await listPurchaseOrders(req.query as Record<string, string>, req.user);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function getPurchaseOrderHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		const data = await getPurchaseOrderById(req.params.id);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function updatePurchaseOrderStatusHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized', 401);
		}

		const data = await updatePurchaseOrderStatus(req.params.id, req.body.status as PurchaseOrderStatus, req.user.id);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}
