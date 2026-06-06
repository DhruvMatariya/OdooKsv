import { QuotationStatus, UserRole } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error.middleware';
import { logActivity } from '../../lib/logger';
import { generateNumber } from '../../lib/service-utils';

export async function createQuotation(
	rfqId: string,
	vendorUserId: string,
	input: {
		totalAmount: number;
		deliveryDays: number;
		validUntil: string;
		notes?: string;
		items: Array<{ rfqItemName: string; quantity: number; unitPrice: number; totalPrice: number }>;
	}
) {
	const user = await prisma.user.findUnique({ where: { id: vendorUserId } });
	if (!user || user.role !== UserRole.VENDOR || !user.vendorId) {
		throw new AppError('Vendor access required', 403);
	}

	const rfq = await prisma.rfq.findUnique({
		where: { id: rfqId },
		include: { vendors: true },
	});
	if (!rfq) {
		throw new AppError('RFQ not found', 404);
	}

	if (rfq.status !== 'PUBLISHED') {
		throw new AppError('RFQ must be published', 400);
	}

	const isAssigned = rfq.vendors.some((vendor) => vendor.vendorId === user.vendorId);
	if (!isAssigned) {
		throw new AppError('Vendor is not assigned to this RFQ', 403);
	}

	if (input.totalAmount <= 0) {
		throw new AppError('Total amount must be greater than 0', 400);
	}

	const quotationNumber = await generateNumber('QT', prisma.quotation, 'quotationNumber');
	const validUntil = new Date(input.validUntil);

	const quotation = await prisma.$transaction(async (tx) => {
		const createdQuotation = await tx.quotation.create({
			data: {
				quotationNumber,
				rfqId,
				vendorId: user.vendorId!,
				totalAmount: input.totalAmount,
				deliveryDays: input.deliveryDays,
				validUntil,
				notes: input.notes,
				status: QuotationStatus.SUBMITTED,
			},
		});

		await tx.quotationItem.createMany({
			data: input.items.map((item) => ({
				quotationId: createdQuotation.id,
				rfqItemName: item.rfqItemName,
				quantity: item.quantity,
				unitPrice: item.unitPrice,
				totalPrice: item.totalPrice,
			})),
		});

		return createdQuotation;
	});

	await logActivity({
		userId: vendorUserId,
		action: 'QUOTATION_SUBMITTED',
		entity: 'Quotation',
		entityId: quotation.id,
		description: `Quotation ${quotation.quotationNumber} submitted`,
	});

	return quotation;
}

export async function listQuotationsForRfq(rfqId: string) {
	const quotations = await prisma.quotation.findMany({
		where: { rfqId },
		include: {
			vendor: { select: { id: true, name: true, rating: true, email: true } },
			rfq: { select: { id: true, rfqNumber: true, title: true } },
			items: true,
		},
		orderBy: { createdAt: 'desc' },
	});

	return quotations.map(q => ({
		...q,
		items: q.items.map(item => ({
			...item,
			rfqItem: {
				name: item.rfqItemName,
				quantity: item.quantity,
				unit: 'pcs' // Defaulting for now as we don't have direct link
			}
		}))
	}));
}

export async function listAllQuotations() {
	const quotations = await prisma.quotation.findMany({
		include: {
			vendor: { select: { id: true, name: true, rating: true, email: true } },
			rfq: { select: { id: true, rfqNumber: true, title: true } },
			items: true,
		},
		orderBy: { createdAt: 'desc' },
	});

	return quotations.map(q => ({
		...q,
		items: q.items.map(item => ({
			...item,
			rfqItem: {
				name: item.rfqItemName,
				quantity: item.quantity,
				unit: 'pcs'
			}
		}))
	}));
}

export async function listMyQuotations(vendorUserId: string) {
	const user = await prisma.user.findUnique({ where: { id: vendorUserId } });
	if (!user || user.role !== UserRole.VENDOR || !user.vendorId) {
		throw new AppError('Vendor access required', 403);
	}

	const quotations = await prisma.quotation.findMany({
		where: { vendorId: user.vendorId },
		include: {
			rfq: true,
			items: true,
		},
		orderBy: { createdAt: 'desc' },
	});

	return quotations;
}

export async function compareQuotationsForRfq(rfqId: string) {
	const rfq = await prisma.rfq.findUnique({
		where: { id: rfqId },
		include: { items: true },
	});
	if (!rfq) {
		throw new AppError('RFQ not found', 404);
	}

	const quotations = await prisma.quotation.findMany({
		where: { rfqId },
		include: {
			vendor: { select: { id: true, name: true, rating: true } },
			items: true,
		},
		orderBy: [{ totalAmount: 'asc' }, { deliveryDays: 'asc' }],
	});

	if (!quotations.length) {
		return {
			rfq: { id: rfq.id, title: rfq.title, items: rfq.items },
			quotations: [],
			lowestPriceId: null,
			fastestDeliveryId: null,
		};
	}

	const lowestPrice = Math.min(...quotations.map((quotation) => quotation.totalAmount));
	const fastestDelivery = Math.min(...quotations.map((quotation) => quotation.deliveryDays));

	return {
		rfq: { id: rfq.id, title: rfq.title, items: rfq.items },
		quotations: quotations.map((quotation) => ({
			id: quotation.id,
			quotationNumber: quotation.quotationNumber,
			vendor: quotation.vendor,
			totalAmount: quotation.totalAmount,
			deliveryDays: quotation.deliveryDays,
			validUntil: quotation.validUntil,
			status: quotation.status,
			isLowestPrice: quotation.totalAmount === lowestPrice,
			isFastestDelivery: quotation.deliveryDays === fastestDelivery,
			items: quotation.items.map((item) => {
				const rfqItem = rfq.items.find((ri) => ri.name === item.rfqItemName);
				return {
					id: item.id,
					rfqItem: {
						name: item.rfqItemName,
						quantity: rfqItem?.quantity || item.quantity,
						unit: rfqItem?.unit || 'pcs',
					},
					unitPrice: item.unitPrice,
					totalPrice: item.totalPrice,
				};
			}),
		})),
		lowestPriceId: quotations.find((quotation) => quotation.totalAmount === lowestPrice)?.id ?? null,
		fastestDeliveryId: quotations.find((quotation) => quotation.deliveryDays === fastestDelivery)?.id ?? null,
	};
}

export async function updateQuotation(id: string, vendorUserId: string, input: Record<string, unknown>) {
	const user = await prisma.user.findUnique({ where: { id: vendorUserId } });
	if (!user || user.role !== UserRole.VENDOR || !user.vendorId) {
		throw new AppError('Vendor access required', 403);
	}

	const quotation = await prisma.quotation.findUnique({ where: { id }, include: { items: true } });
	if (!quotation) {
		throw new AppError('Quotation not found', 404);
	}

	if (quotation.vendorId !== user.vendorId) {
		throw new AppError('You can only edit your own quotation', 403);
	}

	if (quotation.status !== 'DRAFT') {
		throw new AppError('Only draft quotations can be updated', 400);
	}

	const updated = await prisma.$transaction(async (tx) => {
		const quotationUpdate = await tx.quotation.update({
			where: { id },
			data: {
				...(input.totalAmount !== undefined ? { totalAmount: Number(input.totalAmount) } : {}),
				...(input.deliveryDays !== undefined ? { deliveryDays: Number(input.deliveryDays) } : {}),
				...(input.validUntil !== undefined ? { validUntil: new Date(String(input.validUntil)) } : {}),
				...(input.notes !== undefined ? { notes: String(input.notes) } : {}),
				...(input.status !== undefined ? { status: input.status as QuotationStatus } : {}),
			},
		});

		if (Array.isArray(input.items)) {
			await tx.quotationItem.deleteMany({ where: { quotationId: id } });
			await tx.quotationItem.createMany({
				data: (input.items as Array<{ rfqItemName: string; quantity: number; unitPrice: number; totalPrice: number }>).map((item) => ({
					quotationId: id,
					rfqItemName: item.rfqItemName,
					quantity: item.quantity,
					unitPrice: item.unitPrice,
					totalPrice: item.totalPrice,
				})),
			});
		}

		return quotationUpdate;
	});

	await logActivity({
		userId: vendorUserId,
		action: 'QUOTATION_UPDATED',
		entity: 'Quotation',
		entityId: updated.id,
		description: `Quotation ${updated.quotationNumber} updated`,
	});

	return updated;
}

export async function updateQuotationStatus(id: string, status: QuotationStatus, userId: string) {
	const quotation = await prisma.quotation.findUnique({ where: { id } });
	if (!quotation) {
		throw new AppError('Quotation not found', 404);
	}

	const updated = await prisma.quotation.update({
		where: { id },
		data: { status },
	});

	await logActivity({
		userId,
		action: 'QUOTATION_STATUS_UPDATED',
		entity: 'Quotation',
		entityId: updated.id,
		description: `Quotation ${updated.quotationNumber} status updated to ${status}`,
	});

	return updated;
}
