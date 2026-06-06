import { Prisma, UserRole } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { hashPassword } from '../../lib/bcrypt';
import { parsePagination, sanitizeUser } from '../../lib/service-utils';
import { AppError } from '../../middleware/error.middleware';
import { logActivity } from '../../lib/logger';

export async function getUsers(query: {
	page?: number;
	limit?: number;
	search?: string;
	role?: UserRole;
}) {
	const { limit, skip, page } = parsePagination(query);
	
	const where: Prisma.UserWhereInput = {};
	
	if (query.role) {
		where.role = query.role;
	}
	
	if (query.search) {
		where.OR = [
			{ firstName: { contains: query.search, mode: 'insensitive' } },
			{ lastName: { contains: query.search, mode: 'insensitive' } },
			{ email: { contains: query.search, mode: 'insensitive' } },
		];
	}

	const [users, total] = await Promise.all([
		prisma.user.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: 'desc' },
			include: {
				vendor: {
					select: {
						id: true,
						name: true,
					}
				}
			}
		}),
		prisma.user.count({ where }),
	]);

	return {
		users: users.map(sanitizeUser),
		pagination: {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		},
	};
}

export async function getUserById(id: string) {
	const user = await prisma.user.findUnique({
		where: { id },
		include: {
			vendor: true,
		},
	});

	if (!user) {
		throw new AppError('User not found', 404);
	}

	return sanitizeUser(user);
}

export async function createUser(
	adminId: string,
	data: {
		firstName: string;
		lastName: string;
		email: string;
		password?: string;
		role: UserRole;
		phone?: string;
		country?: string;
		additionalInfo?: string;
		vendorId?: string;
	}
) {
	const existingUser = await prisma.user.findUnique({
		where: { email: data.email },
	});

	if (existingUser) {
		throw new AppError('Email already exists', 409);
	}

	// Default password if not provided
	const rawPassword = data.password || 'Welcome@123';
	const hashedPassword = await hashPassword(rawPassword);

	const user = await prisma.user.create({
		data: {
			firstName: data.firstName,
			lastName: data.lastName,
			email: data.email,
			password: hashedPassword,
			role: data.role,
			phone: data.phone || null,
			country: data.country || null,
			additionalInfo: data.additionalInfo || null,
			vendorId: data.vendorId || null,
		},
	});

	await logActivity({
		userId: adminId,
		action: 'USER_CREATED',
		entity: 'User',
		entityId: user.id,
		description: `Admin created user ${user.email}`,
	});

	return sanitizeUser(user);
}

export async function updateUser(
	adminId: string,
	id: string,
	data: Partial<{
		firstName: string;
		lastName: string;
		email: string;
		role: UserRole;
		phone: string;
		country: string;
		additionalInfo: string;
		vendorId: string;
	}>
) {
	const user = await prisma.user.findUnique({ where: { id } });
	if (!user) {
		throw new AppError('User not found', 404);
	}

	if (data.email && data.email !== user.email) {
		const existingUser = await prisma.user.findUnique({
			where: { email: data.email },
		});
		if (existingUser) {
			throw new AppError('Email already exists', 409);
		}
	}

	const updatedUser = await prisma.user.update({
		where: { id },
		data: {
			firstName: data.firstName || undefined,
			lastName: data.lastName || undefined,
			email: data.email || undefined,
			role: data.role || undefined,
			phone: data.phone || undefined,
			country: data.country || undefined,
			additionalInfo: data.additionalInfo || undefined,
			vendorId: data.vendorId || undefined,
		},
	});

	await logActivity({
		userId: adminId,
		action: 'USER_UPDATED',
		entity: 'User',
		entityId: id,
		description: `Admin updated user ${updatedUser.email}`,
		metadata: data as any,
	});

	return sanitizeUser(updatedUser);
}

export async function deleteUser(adminId: string, id: string) {
	const user = await prisma.user.findUnique({ where: { id } });
	if (!user) {
		throw new AppError('User not found', 404);
	}

	if (user.id === adminId) {
		throw new AppError('Cannot delete yourself', 400);
	}

	await prisma.user.delete({ where: { id } });

	await logActivity({
		userId: adminId,
		action: 'USER_DELETED',
		entity: 'User',
		entityId: id,
		description: `Admin deleted user ${user.email}`,
	});

	return { success: true };
}
