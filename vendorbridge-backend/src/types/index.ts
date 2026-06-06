import { UserRole } from '@prisma/client';
import { Request } from 'express';

export interface AuthUser {
	id: string;
	email: string;
	role: UserRole;
	vendorId?: string | null;
}

export interface AuthenticatedRequest extends Request {
	user?: AuthUser;
}

export interface PaginationResult<T> {
	items: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
