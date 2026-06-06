import { ApprovalStatus, UserRole } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error.middleware';
import { logActivity } from '../../lib/logger';

export async function createApproval(input: { rfqId: string; approverId: string }, userId: string) {
	const rfq = await prisma.rfq.findUnique({ where: { id: input.rfqId }, include: { approval: true } });
	if (!rfq) {
		throw new AppError('RFQ not found', 404);
	}

	if (rfq.status !== 'CLOSED') {
		throw new AppError('RFQ must be closed before requesting approval', 400);
	}

	if (rfq.approval && rfq.approval.status === ApprovalStatus.PENDING) {
		throw new AppError('A pending approval already exists', 409);
	}

	const approver = await prisma.user.findUnique({ where: { id: input.approverId } });
	if (!approver || (approver.role !== UserRole.MANAGER && approver.role !== UserRole.ADMIN)) {
		throw new AppError('Approver must be a manager or admin', 400);
	}

	const approval = await prisma.approval.create({
		data: {
			rfqId: rfq.id,
			approverId: input.approverId,
			status: ApprovalStatus.PENDING,
		},
	});

	await logActivity({
		userId,
		action: 'APPROVAL_REQUESTED',
		entity: 'Approval',
		entityId: approval.id,
		description: `Approval requested for RFQ ${rfq.rfqNumber}`,
	});

	return approval;
}

export async function getApprovalById(id: string) {
	const approval = await prisma.approval.findUnique({
		where: { id },
		include: {
			rfq: true,
			approver: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
		},
	});

	if (!approval) {
		throw new AppError('Approval not found', 404);
	}

	return approval;
}

export async function approveRequest(id: string, userId: string, remarks?: string) {
	const approval = await prisma.approval.findUnique({ where: { id } });
	if (!approval) {
		throw new AppError('Approval not found', 404);
	}

	const updated = await prisma.approval.update({
		where: { id },
		data: {
			status: ApprovalStatus.APPROVED,
			remarks,
			resolvedAt: new Date(),
		},
	});

	await logActivity({
		userId,
		action: 'APPROVAL_APPROVED',
		entity: 'Approval',
		entityId: updated.id,
		description: `Approval ${updated.id} approved`,
	});

	return updated;
}

export async function listApprovals(query: { status?: string }, user: { id: string; role: UserRole }) {
	const where: any = {};
	if (query.status) {
		where.status = query.status.toUpperCase() as ApprovalStatus;
	}

	if (user.role === UserRole.MANAGER) {
		where.approverId = user.id;
	}

	const approvals = await prisma.approval.findMany({
		where,
		include: {
			rfq: {
				include: {
					createdBy: { select: { id: true, firstName: true, lastName: true } },
					items: true,
					quotations: {
						where: { status: 'SUBMITTED' },
						include: { vendor: true, items: true },
						take: 1,
					},
				},
			},
			approver: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
		},
		orderBy: { createdAt: 'desc' },
	});

	return approvals;
}

export async function rejectRequest(id: string, userId: string, remarks: string) {
	const approval = await prisma.approval.findUnique({ where: { id } });
	if (!approval) {
		throw new AppError('Approval not found', 404);
	}

	const updated = await prisma.approval.update({
		where: { id },
		data: {
			status: ApprovalStatus.REJECTED,
			remarks,
			resolvedAt: new Date(),
		},
	});

	await logActivity({
		userId,
		action: 'APPROVAL_REJECTED',
		entity: 'Approval',
		entityId: updated.id,
		description: `Approval ${updated.id} rejected`,
	});

	return updated;
}
