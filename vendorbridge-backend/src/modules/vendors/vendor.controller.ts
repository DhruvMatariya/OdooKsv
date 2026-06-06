import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AppError } from '../../middleware/error.middleware';
import {
	createVendor,
	deactivateVendor,
	getVendorById,
	listVendors,
	updateVendor,
} from './vendor.service';

export async function getAllVendors(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		const data = await listVendors(req.query as Record<string, string>);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function createVendorHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized', 401);
		}

		const data = await createVendor(req.body, req.user.id);
		res.status(201).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function getVendorHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		const data = await getVendorById(req.params.id);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function updateVendorHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized', 401);
		}

		const data = await updateVendor(req.params.id, req.body, req.user.id);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function deleteVendorHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized', 401);
		}

		const data = await deactivateVendor(req.params.id, req.user.id);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}
