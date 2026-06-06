import { NextFunction, Request, Response } from 'express';

export class AppError extends Error {
	statusCode: number;
	isOperational: boolean;

	constructor(message: string, statusCode: number) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = true;
		Error.captureStackTrace(this, this.constructor);
	}
}

export function errorMiddleware(
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction
): void {
	if (err instanceof AppError) {
		res.status(err.statusCode).json({ success: false, error: err.message });
		return;
	}

	const prismaError = err as Error & { code?: string; meta?: { target?: string | string[] } };
	if (prismaError.code === 'P2002') {
		const target = Array.isArray(prismaError.meta?.target)
			? prismaError.meta?.target.join(', ')
			: prismaError.meta?.target;

		res.status(409).json({ success: false, error: `${target ?? 'Resource'} already exists` });
		return;
	}

	if (prismaError.code === 'P2025') {
		res.status(404).json({ success: false, error: 'Record not found' });
		return;
	}

	console.error('Unhandled error:', err);
	res.status(500).json({
		success: false,
		error: 'Internal server error',
		message: process.env.NODE_ENV === 'development' ? err.message : undefined,
		stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
	});
}
