import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

interface LogParams {
	userId: string;
	action: string;
	entity: string;
	entityId: string;
	description: string;
	metadata?: Prisma.InputJsonValue;
}

export async function logActivity(params: LogParams): Promise<void> {
	try {
		await prisma.activityLog.create({ data: params });
	} catch {
		console.error('Failed to write activity log');
	}
}
