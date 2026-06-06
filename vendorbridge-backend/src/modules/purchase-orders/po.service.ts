import { PurchaseOrderStatus, QuotationStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error.middleware';
import { logActivity } from '../../lib/logger';
import { generateNumber, parsePagination } from '../../lib/service-utils';

export async function createPurchaseOrder(input: {
	quotationId: string;
	deliveryDate: string;
	terms?: string;
	taxRate?: number;
}, userId: string) {
	const quotation = await prisma.quotation.findUnique({
		where: { id: input.quotationId },
		include: { rfq: { include: { approval: true } }, vendor: true },
	});

	if (!quotation) {
		throw new AppError('Quotation not found', 404);
	}

	if (quotation.status !== QuotationStatus.SUBMITTED) {
		throw new AppError('Quotation must be submitted', 400);
	}

	if (!quotation.rfq.approval || quotation.rfq.approval.status !== 'APPROVED') {
		throw new AppError('RFQ approval must be approved', 400);
	}

	const taxRate = Number(input.taxRate ?? 18);
	const taxAmount = quotation.totalAmount * (taxRate / 100);
	const grandTotal = quotation.totalAmount + taxAmount;
	const poNumber = await generateNumber('PO', prisma.purchaseOrder);

	const purchaseOrder = await prisma.$transaction(async (tx) => {
		await tx.quotation.update({ where: { id: quotation.id }, data: { status: QuotationStatus.ACCEPTED } });
		await tx.vendor.update({ where: { id: quotation.vendorId }, data: { totalOrders: { increment: 1 } } });

		return tx.purchaseOrder.create({
			data: {
				poNumber,
				quotationId: quotation.id,
				vendorId: quotation.vendorId,
				deliveryDate: new Date(input.deliveryDate),
				terms: input.terms,
				taxRate,
				taxAmount,
				totalAmount: quotation.totalAmount,
				grandTotal,
				status: PurchaseOrderStatus.CONFIRMED,
			},
		});
	});

	await logActivity({
		userId,
		action: 'PO_CREATED',
		entity: 'PurchaseOrder',
		entityId: purchaseOrder.id,
		description: `Purchase order ${purchaseOrder.poNumber} created`,
	});

	return purchaseOrder;
}

export async function listPurchaseOrders(query: { status?: string; page?: string | number; limit?: string | number }) {
	const { page, limit, skip } = parsePagination(query);
	const where: Record<string, unknown> = {};

	if (query.status) {
		where.status = query.status.toUpperCase() as PurchaseOrderStatus;
	}

	const [purchaseOrders, total] = await Promise.all([
		prisma.purchaseOrder.findMany({
			where,
			skip,
			take: limit,
			include: {
				quotation: { include: { vendor: true } },
				vendor: true,
			},
			orderBy: { createdAt: 'desc' },
		}),
		prisma.purchaseOrder.count({ where }),
	]);

	return { purchaseOrders, total, page, limit };
}

export async function getPurchaseOrderById(id: string) {
	const purchaseOrder = await prisma.purchaseOrder.findUnique({
		where: { id },
		include: {
			quotation: {
				include: {
					items: true,
					vendor: true,
					rfq: true,
				},
			},
			vendor: true,
		},
	});

	if (!purchaseOrder) {
		throw new AppError('Purchase order not found', 404);
	}

	return purchaseOrder;
}

export async function updatePurchaseOrderStatus(id: string, status: PurchaseOrderStatus, userId: string) {
	const purchaseOrder = await prisma.purchaseOrder.findUnique({ where: { id } });
	if (!purchaseOrder) {
		throw new AppError('Purchase order not found', 404);
	}

	const updated = await prisma.purchaseOrder.update({ where: { id }, data: { status } });

	await logActivity({
		userId,
		action: 'PO_STATUS_UPDATED',
		entity: 'PurchaseOrder',
		entityId: updated.id,
		description: `Purchase order ${updated.poNumber} status updated to ${status}`,
	});

	return updated;
}
