import { InvoiceStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error.middleware';
import { logActivity } from '../../lib/logger';
import { generateNumber } from '../../lib/service-utils';
import { generateInvoicePDF } from '../../lib/pdf';
import { sendInvoiceEmail } from '../../lib/email';

export async function createInvoice(input: { purchaseOrderId: string; dueDate: string; taxRate?: number }, userId: string) {
	const purchaseOrder = await prisma.purchaseOrder.findUnique({
		where: { id: input.purchaseOrderId },
		include: {
			quotation: { include: { vendor: true, items: true } },
			invoice: true,
		},
	});

	if (!purchaseOrder) {
		throw new AppError('Purchase order not found', 404);
	}

	if (purchaseOrder.status !== 'CONFIRMED') {
		throw new AppError('Purchase order must be confirmed', 400);
	}

	if (purchaseOrder.invoice) {
		throw new AppError('Invoice already exists for this purchase order', 409);
	}

	const subtotal = purchaseOrder.totalAmount;
	const taxRate = Number(input.taxRate ?? 18);
	const taxAmount = subtotal * (taxRate / 100);
	const grandTotal = subtotal + taxAmount;
	const invoiceNumber = await generateNumber('INV', prisma.invoice);

	const invoice = await prisma.invoice.create({
		data: {
			invoiceNumber,
			purchaseOrderId: purchaseOrder.id,
			dueDate: new Date(input.dueDate),
			subtotal,
			taxRate,
			taxAmount,
			grandTotal,
			status: InvoiceStatus.DRAFT,
		},
	});

	await logActivity({
		userId,
		action: 'INVOICE_CREATED',
		entity: 'Invoice',
		entityId: invoice.id,
		description: `Invoice ${invoice.invoiceNumber} created`,
	});

	return invoice;
}

export async function getInvoiceById(id: string) {
	const invoice = await prisma.invoice.findUnique({
		where: { id },
		include: {
			purchaseOrder: {
				include: {
					quotation: {
						include: {
							vendor: true,
							items: true,
							rfq: true,
						},
					},
					vendor: true,
				},
			},
		},
	});

	if (!invoice) {
		throw new AppError('Invoice not found', 404);
	}

	return invoice;
}

export async function generateInvoicePdfById(id: string) {
	const invoice = await getInvoiceById(id);
	return generateInvoicePDF(invoice, invoice.purchaseOrder);
}

export async function emailInvoice(id: string, recipientEmail: string, userId: string) {
	const invoice = await getInvoiceById(id);
	const pdfBuffer = await generateInvoicePDF(invoice, invoice.purchaseOrder);
	await sendInvoiceEmail(recipientEmail, invoice.invoiceNumber, pdfBuffer);

	const updated = await prisma.invoice.update({ where: { id }, data: { status: InvoiceStatus.SENT } });

	await logActivity({
		userId,
		action: 'INVOICE_EMAILED',
		entity: 'Invoice',
		entityId: updated.id,
		description: `Invoice ${updated.invoiceNumber} emailed to ${recipientEmail}`,
	});

	return updated;
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus, userId: string) {
	const invoice = await prisma.invoice.findUnique({ where: { id } });
	if (!invoice) {
		throw new AppError('Invoice not found', 404);
	}

	const updated = await prisma.invoice.update({
		where: { id },
		data: {
			status,
			...(status === InvoiceStatus.PAID ? { paidAt: new Date() } : {}),
		},
	});

	await logActivity({
		userId,
		action: 'INVOICE_STATUS_UPDATED',
		entity: 'Invoice',
		entityId: updated.id,
		description: `Invoice ${updated.invoiceNumber} status updated to ${status}`,
	});

	return updated;
}
