import { body } from 'express-validator';

export const createApprovalValidation = [
	body('rfqId').notEmpty().withMessage('RFQ id is required'),
	body('approverId').notEmpty().withMessage('Approver id is required'),
];

export const decisionValidation = [
	body('remarks').optional().isString(),
];

export const rejectValidation = [
	body('remarks').notEmpty().withMessage('Remarks are required for rejection'),
];
