import { VendorCategory, VendorStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error.middleware';
import { logActivity } from '../../lib/logger';
import { parsePagination } from '../../lib/service-utils';

function normalizeCategory(category: string): string {
	return category.replace(/\s+/g, '_').toUpperCase();
}

function normalizeStatus(status?: string): VendorStatus | undefined {
	if (!status) {
		return undefined;
	}

	const normalized = status.toUpperCase();
	if (normalized !== 'ACTIVE' && normalized !== 'INACTIVE') {
		throw new AppError('Status is invalid', 400);
	}

	return normalized as VendorStatus;
}

export async function listVendors(query: {
	search?: string;
	category?: string;
	status?: string;
	page?: string | number;
	limit?: string | number;
}) {
	const { page, limit, skip } = parsePagination(query);
	const where: Record<string, unknown> = {};

	if (query.search) {
		where.name = { contains: query.search, mode: 'insensitive' };
	}

	if (query.category) {
		where.category = normalizeCategory(query.category) as VendorCategory;
	}

	const status = normalizeStatus(query.status);
	if (status) {
		where.status = status;
	}

	const [vendors, total] = await Promise.all([
		prisma.vendor.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: 'desc' },
			include: {
				_count: { select: { quotations: true, purchaseOrders: true } },
			},
		}),
		prisma.vendor.count({ where }),
	]);

	return { vendors, total, page, limit };
}

export async function createVendor(input: Record<string, string>, userId: string) {
	const vendor = await prisma.vendor.create({
		data: {
			name: input.name,
			email: input.email,
			phone: input.phone,
			address: input.address,
			city: input.city,
			state: input.state,
			gstNumber: input.gstNumber,
			category: normalizeCategory(input.category) as VendorCategory,
		},
	});

	await logActivity({
		userId,
		action: 'VENDOR_CREATED',
		entity: 'Vendor',
		entityId: vendor.id,
		description: `Vendor ${vendor.name} created`,
	});

	return vendor;
}

export async function getVendorById(id: string) {
	const vendor = await prisma.vendor.findUnique({
		where: { id },
		include: {
			_count: {
				select: { quotations: true, purchaseOrders: true },
			},
			quotations: {
				include: {
					rfq: { select: { id: true, rfqNumber: true, title: true, status: true } },
				},
				orderBy: { createdAt: 'desc' },
			},
			purchaseOrders: {
				include: {
					quotation: {
						include: {
							rfq: { select: { id: true, rfqNumber: true, title: true } },
						},
					},
				},
				orderBy: { createdAt: 'desc' },
			},
		},
	});

	if (!vendor) {
		throw new AppError('Vendor not found', 404);
	}

	return vendor;
}

export async function updateVendor(id: string, input: Record<string, string>, userId: string) {
	const existing = await prisma.vendor.findUnique({ where: { id } });
	if (!existing) {
		throw new AppError('Vendor not found', 404);
	}

	const vendor = await prisma.vendor.update({
		where: { id },
		data: {
			...(input.name ? { name: input.name } : {}),
			...(input.email ? { email: input.email } : {}),
			...(input.phone ? { phone: input.phone } : {}),
			...(input.address ? { address: input.address } : {}),
			...(input.city ? { city: input.city } : {}),
			...(input.state ? { state: input.state } : {}),
			...(input.gstNumber ? { gstNumber: input.gstNumber } : {}),
			...(input.category ? { category: normalizeCategory(input.category) as VendorCategory } : {}),
			...(input.status ? { status: normalizeStatus(input.status) } : {}),
		},
	});

	await logActivity({
		userId,
		action: 'VENDOR_UPDATED',
		entity: 'Vendor',
		entityId: vendor.id,
		description: `Vendor ${vendor.name} updated`,
	});

	return vendor;
}

export async function deactivateVendor(id: string, userId: string) {
	const vendor = await prisma.vendor.findUnique({ where: { id } });
	if (!vendor) {
		throw new AppError('Vendor not found', 404);
	}

	const updated = await prisma.vendor.update({
		where: { id },
		data: { status: VendorStatus.INACTIVE },
	});

	await logActivity({
		userId,
		action: 'VENDOR_DEACTIVATED',
		entity: 'Vendor',
		entityId: updated.id,
		description: `Vendor ${updated.name} deactivated`,
	});

	return updated;
}
