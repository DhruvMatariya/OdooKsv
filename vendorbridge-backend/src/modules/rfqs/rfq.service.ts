import { RfqStatus, UserRole } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error.middleware';
import { logActivity } from '../../lib/logger';
import { generateNumber, parsePagination } from '../../lib/service-utils';

function ensureFutureDate(deadline: string): Date {
	const parsed = new Date(deadline);
	if (Number.isNaN(parsed.getTime()) || parsed <= new Date()) {
		throw new AppError('Deadline must be a future date', 400);
	}

	return parsed;
}

export async function createRfq(input: {
	title: string;
	description: string;
	deadline: string;
	items: Array<{ name: string; description: string; quantity: number; unit: string }>;
	vendorIds: string[];
}, userId: string) {
	const deadline = ensureFutureDate(input.deadline);
	const rfqNumber = await generateNumber('RFQ', prisma.rfq);

	const rfq = await prisma.$transaction(async (tx) => {
		const createdRfq = await tx.rfq.create({
			data: {
				rfqNumber,
				title: input.title,
				description: input.description,
				deadline,
				createdById: userId,
			},
		});

		await tx.rfqItem.createMany({
			data: input.items.map((item) => ({
				rfqId: createdRfq.id,
				name: item.name,
				description: item.description,
				quantity: Number(item.quantity),
				unit: item.unit,
			})),
		});

		await tx.rfqVendor.createMany({
			data: input.vendorIds.map((vendorId) => ({ rfqId: createdRfq.id, vendorId })),
		});

		return createdRfq;
	});

	await logActivity({
		userId,
		action: 'RFQ_CREATED',
		entity: 'Rfq',
		entityId: rfq.id,
		description: `RFQ ${rfq.rfqNumber} created`,
	});

	return rfq;
}

export async function listRfqs(query: { status?: string; page?: string | number; limit?: string | number }) {
	const { page, limit, skip } = parsePagination(query);
	const where: Record<string, unknown> = {};

	if (query.status) {
		where.status = query.status.toUpperCase() as RfqStatus;
	}

	const [rfqs, total] = await Promise.all([
		prisma.rfq.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: 'desc' },
			include: {
				_count: { select: { items: true, vendors: true, quotations: true } },
			},
		}),
		prisma.rfq.count({ where }),
	]);

	return { rfqs, total, page, limit };
}

export async function getRfqById(id: string) {
	const rfq = await prisma.rfq.findUnique({
		where: { id },
		include: {
			items: true,
			vendors: { include: { vendor: true } },
			quotations: {
				include: {
					vendor: { select: { id: true, name: true, rating: true, email: true } },
					items: true,
				},
			},
			approval: {
				include: {
					approver: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
				},
			},
		},
	});

	if (!rfq) {
		throw new AppError('RFQ not found', 404);
	}

	return rfq;
}

export async function publishRfq(id: string, userId: string) {
	const rfq = await prisma.rfq.findUnique({ where: { id } });
	if (!rfq) {
		throw new AppError('RFQ not found', 404);
	}

	if (rfq.status !== 'DRAFT') {
		throw new AppError('Only draft RFQs can be published', 400);
	}

	if (rfq.deadline <= new Date()) {
		throw new AppError('RFQ deadline has passed', 400);
	}

	const updated = await prisma.rfq.update({
		where: { id },
		data: { status: 'PUBLISHED' },
	});

	await logActivity({
		userId,
		action: 'RFQ_PUBLISHED',
		entity: 'Rfq',
		entityId: updated.id,
		description: `RFQ ${updated.rfqNumber} published`,
	});

	return updated;
}

export async function closeRfq(id: string, userId: string) {
	const rfq = await prisma.rfq.findUnique({ where: { id } });
	if (!rfq) {
		throw new AppError('RFQ not found', 404);
	}

	if (rfq.status !== 'PUBLISHED') {
		throw new AppError('Only published RFQs can be closed', 400);
	}

	const updated = await prisma.rfq.update({
		where: { id },
		data: { status: 'CLOSED' },
	});

	await logActivity({
		userId,
		action: 'RFQ_CLOSED',
		entity: 'Rfq',
		entityId: updated.id,
		description: `RFQ ${updated.rfqNumber} closed`,
	});

	return updated;
}
