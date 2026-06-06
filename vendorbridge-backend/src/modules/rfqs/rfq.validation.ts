import { body } from 'express-validator';

const itemValidation = [
	body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
	body('items.*.name').trim().notEmpty().withMessage('Item name is required'),
	body('items.*.description').optional().trim(),
	body('items.*.quantity').isFloat({ gt: 0 }).withMessage('Item quantity must be greater than 0'),
	body('items.*.unit').trim().notEmpty().withMessage('Item unit is required'),
];

export const createRfqValidation = [
	body('title').trim().notEmpty().withMessage('Title is required'),
	body('description').optional().trim(),
	body('deadline').isISO8601().withMessage('Deadline must be a valid date').custom((value) => {
		const deadline = new Date(value);
		const now = new Date();
		// Set to start of day for comparison to be more lenient with "today"
		now.setHours(0, 0, 0, 0);
		return deadline >= now;
	}).withMessage('Deadline must be today or a future date'),
	...itemValidation,
	body('vendorIds').isArray({ min: 1 }).withMessage('At least one vendor is required'),
	body('vendorIds.*').notEmpty().withMessage('Vendor id is required'),
];
