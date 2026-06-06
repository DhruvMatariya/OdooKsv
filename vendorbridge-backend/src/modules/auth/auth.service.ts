import { UserRole } from '@prisma/client';
import { comparePassword, hashPassword } from '../../lib/bcrypt';
import { logActivity } from '../../lib/logger';
import { signToken } from '../../lib/jwt';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error.middleware';

interface UserRecord {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	phone: string | null;
	country: string | null;
	additionalInfo: string | null;
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
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role: UserRole;
	phone?: string;
	country?: string;
	companyName?: string;
	gstNumber?: string;
	additionalInfo?: string;
}): Promise<{ user: Omit<UserRecord, 'password'>; token: string }> {
	const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
	if (existingUser) {
		throw new AppError('Email already exists', 409);
	}

	const password = await hashPassword(input.password);
	
	let vendorId: string | undefined = undefined;

	if (input.role === UserRole.VENDOR && input.companyName && input.gstNumber) {
		const vendor = await prisma.vendor.create({
			data: {
				name: input.companyName,
				email: input.email,
				phone: input.phone || '',
				gstNumber: input.gstNumber,
			}
		});
		vendorId = vendor.id;
	}

	const user = await prisma.user.create({
		data: {
			firstName: input.firstName,
			lastName: input.lastName,
			email: input.email,
			password,
			role: input.role,
			phone: input.phone,
			country: input.country,
			additionalInfo: input.additionalInfo,
			vendorId,
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
}): Promise<{ user: Omit<UserRecord, 'password'>; token: string }> {
	const user = await prisma.user.findUnique({ where: { email: input.email } });
	if (!user) {
		throw new AppError('Invalid credentials', 401);
	}

	const passwordIsValid = await comparePassword(input.password, user.password);
	if (!passwordIsValid) {
		throw new AppError('Invalid credentials', 401);
	}

	return {
		user: sanitizeUser(user),
		token: signToken(buildTokenPayload(user)),
	};
}

export async function getCurrentUser(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
			role: true,
			phone: true,
			country: true,
			additionalInfo: true,
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
