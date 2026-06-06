import { UserRole } from '@prisma/client';
import { comparePassword, hashPassword } from '../../lib/bcrypt';
import { logActivity } from '../../lib/logger';
import { signToken } from '../../lib/jwt';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error.middleware';

interface UserRecord {
	id: string;
	name: string;
	email: string;
	password: string;
	role: UserRole;
	vendorId: string | null;
	createdAt: Date;
	updatedAt: Date;
}

function sanitizeUser(user: UserRecord): Omit<UserRecord, 'password'> {
	const { password, ...safeUser } = user;
	return safeUser;
}

function buildTokenPayload(user: { id: string; email: string; role: UserRole; vendorId?: string | null }) {
	return {
		id: user.id,
		email: user.email,
		role: user.role,
		vendorId: user.vendorId ?? null,
	};
}

export async function registerUser(input: {
	name: string;
	email: string;
	password: string;
	role: UserRole;
}): Promise<{ user: Omit<UserRecord, 'password'>; token: string }> {
	const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
	if (existingUser) {
		throw new AppError('Email already exists', 409);
	}

	const password = await hashPassword(input.password);
	const user = await prisma.user.create({
		data: {
			name: input.name,
			email: input.email,
			password,
			role: input.role,
		},
	});

	await logActivity({
		userId: user.id,
		action: 'USER_REGISTERED',
		entity: 'User',
		entityId: user.id,
		description: `User ${user.email} registered`,
	});

	return {
		user: sanitizeUser(user),
		token: signToken(buildTokenPayload(user)),
	};
}

export async function loginUser(input: {
	email: string;
	password: string;
}): Promise<{ user: { id: string; name: string; email: string; role: UserRole }; token: string }> {
	const user = await prisma.user.findUnique({ where: { email: input.email } });
	if (!user) {
		throw new AppError('Invalid credentials', 401);
	}

	const passwordIsValid = await comparePassword(input.password, user.password);
	if (!passwordIsValid) {
		throw new AppError('Invalid credentials', 401);
	}

	return {
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
		},
		token: signToken(buildTokenPayload(user)),
	};
}

export async function getCurrentUser(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			vendorId: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	if (!user) {
		throw new AppError('User not found', 404);
	}

	return user;
}
