import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AppError } from '../../middleware/error.middleware';
import { approveRequest, createApproval, getApprovalById, rejectRequest, listApprovals } from './approval.service';

export async function createApprovalHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized', 401);
		}

		const data = await createApproval(req.body, req.user.id);
		res.status(201).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function getApprovalHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		const data = await getApprovalById(req.params.id);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function approveHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized', 401);
		}

		const data = await approveRequest(req.params.id, req.user.id, req.body.remarks);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function rejectHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized', 401);
		}

		const data = await rejectRequest(req.params.id, req.user.id, req.body.remarks);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function listApprovalsHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized', 401);
		}
		const data = await listApprovals(req.query as Record<string, string>, req.user);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}
