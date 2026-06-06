import { InvoiceStatus } from '@prisma/client';
import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AppError } from '../../middleware/error.middleware';
import { createInvoice, emailInvoice, generateInvoicePdfById, getInvoiceById, updateInvoiceStatus } from './invoice.service';

export async function createInvoiceHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized', 401);
		}

		const data = await createInvoice(req.body, req.user.id);
		res.status(201).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function getInvoiceHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		const data = await getInvoiceById(req.params.id);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function getInvoicePdfHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		const invoice = await getInvoiceById(req.params.id);
		const pdf = await generateInvoicePdfById(req.params.id);
		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNumber}.pdf`);
		res.status(200).send(pdf);
	} catch (error) {
		next(error);
	}
}

export async function emailInvoiceHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized', 401);
		}

		const data = await emailInvoice(req.params.id, req.body.recipientEmail, req.user.id);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

export async function updateInvoiceStatusHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.user) {
			throw new AppError('Unauthorized', 401);
		}

		const data = await updateInvoiceStatus(req.params.id, req.body.status as InvoiceStatus, req.user.id);
		res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}
