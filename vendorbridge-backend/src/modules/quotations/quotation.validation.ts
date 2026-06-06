import { body } from 'express-validator';

const quotationItemValidation = [
	body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
	body('items.*.rfqItemName').trim().notEmpty().withMessage('RFQ item name is required'),
	body('items.*.quantity').isFloat({ gt: 0 }).withMessage('Quantity must be greater than 0'),
	body('items.*.unitPrice').isFloat({ gt: 0 }).withMessage('Unit price must be greater than 0'),
	body('items.*.totalPrice').isFloat({ gt: 0 }).withMessage('Total price must be greater than 0'),
];

export const createQuotationValidation = [
	body('totalAmount').isFloat({ gt: 0 }).withMessage('Total amount must be greater than 0'),
	body('deliveryDays').isInt({ gt: 0 }).withMessage('Delivery days must be greater than 0'),
	body('validUntil').isISO8601().withMessage('Valid until must be a valid date'),
	body('notes').optional().isString(),
	...quotationItemValidation,
];

export const updateQuotationValidation = [
	body('totalAmount').optional().isFloat({ gt: 0 }).withMessage('Total amount must be greater than 0'),
	body('deliveryDays').optional().isInt({ gt: 0 }).withMessage('Delivery days must be greater than 0'),
	body('validUntil').optional().isISO8601().withMessage('Valid until must be a valid date'),
	body('notes').optional().isString(),
	body('status').optional().isIn(['DRAFT', 'SUBMITTED', 'ACCEPTED']).withMessage('Status is invalid'),
	body('items').optional().isArray({ min: 1 }).withMessage('Items must be an array'),
	body('items.*.rfqItemName').optional().trim().notEmpty(),
	body('items.*.quantity').optional().isFloat({ gt: 0 }),
	body('items.*.unitPrice').optional().isFloat({ gt: 0 }),
	body('items.*.totalPrice').optional().isFloat({ gt: 0 }),
];
