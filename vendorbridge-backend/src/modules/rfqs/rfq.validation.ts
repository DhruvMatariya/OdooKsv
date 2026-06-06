import { body } from 'express-validator';

const itemValidation = [
	body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
	body('items.*.name').trim().notEmpty().withMessage('Item name is required'),
	body('items.*.description').trim().notEmpty().withMessage('Item description is required'),
	body('items.*.quantity').isFloat({ gt: 0 }).withMessage('Item quantity must be greater than 0'),
	body('items.*.unit').trim().notEmpty().withMessage('Item unit is required'),
];

export const createRfqValidation = [
	body('title').trim().notEmpty().withMessage('Title is required'),
	body('description').trim().notEmpty().withMessage('Description is required'),
	body('deadline').isISO8601().withMessage('Deadline must be a valid date').custom((value) => new Date(value) > new Date()).withMessage('Deadline must be a future date'),
	...itemValidation,
	body('vendorIds').isArray({ min: 1 }).withMessage('At least one vendor is required'),
	body('vendorIds.*').notEmpty().withMessage('Vendor id is required'),
];
