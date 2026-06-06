import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as userService from './user.service';
import { UserRole } from '@prisma/client';

export async function getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
	try {
		const { page, limit, search, role } = req.query;
		const result = await userService.getUsers({
			page: page ? Number(page) : undefined,
			limit: limit ? Number(limit) : undefined,
			search: search as string,
			role: role as UserRole,
		});
		res.status(200).json({ success: true, data: result });
	} catch (error) {
		next(error);
	}
}

export async function getUser(req: AuthRequest, res: Response, next: NextFunction) {
	try {
		const user = await userService.getUserById(req.params.id);
		res.status(200).json({ success: true, data: user });
	} catch (error) {
		next(error);
	}
}

export async function createNewUser(req: AuthRequest, res: Response, next: NextFunction) {
	try {
		const user = await userService.createUser(req.user!.id, req.body);
		res.status(201).json({ success: true, data: user });
	} catch (error) {
		next(error);
	}
}

export async function updateExistingUser(req: AuthRequest, res: Response, next: NextFunction) {
	try {
		const user = await userService.updateUser(req.user!.id, req.params.id, req.body);
		res.status(200).json({ success: true, data: user });
	} catch (error) {
		next(error);
	}
}

export async function removeUser(req: AuthRequest, res: Response, next: NextFunction) {
	try {
		const result = await userService.deleteUser(req.user!.id, req.params.id);
		res.status(200).json({ success: true, data: result });
	} catch (error) {
		next(error);
	}
}
