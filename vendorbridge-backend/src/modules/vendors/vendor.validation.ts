import { body } from 'express-validator';

const categories = ['IT', 'LOGISTICS', 'OFFICE_SUPPLIES', 'MANUFACTURING'];
const statusValues = ['ACTIVE', 'INACTIVE'];

export const createVendorValidation = [
	body('name').trim().notEmpty().withMessage('Name is required'),
	body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
	body('phone').trim().notEmpty().withMessage('Phone is required'),
	body('address').trim().notEmpty().withMessage('Address is required'),
	body('city').trim().notEmpty().withMessage('City is required'),
	body('state').trim().notEmpty().withMessage('State is required'),
	body('gstNumber').matches(/^[A-Za-z0-9]{15}$/).withMessage('GST number must be 15 alphanumeric characters'),
	body('category')
		.trim()
		.custom((value) => categories.includes(String(value).replace(/\s+/g, '_').toUpperCase()) || categories.includes(String(value).toUpperCase()))
		.withMessage('Category is invalid'),
];

export const updateVendorValidation = [
	body('name').optional().trim().notEmpty().withMessage('Name is required'),
	body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
	body('phone').optional().trim().notEmpty().withMessage('Phone is required'),
	body('address').optional().trim().notEmpty().withMessage('Address is required'),
	body('city').optional().trim().notEmpty().withMessage('City is required'),
	body('state').optional().trim().notEmpty().withMessage('State is required'),
	body('gstNumber').optional().matches(/^[A-Za-z0-9]{15}$/).withMessage('GST number must be 15 alphanumeric characters'),
	body('category')
		.optional()
		.trim()
		.custom((value) => categories.includes(String(value).replace(/\s+/g, '_').toUpperCase()) || categories.includes(String(value).toUpperCase()))
		.withMessage('Category is invalid'),
	body('status').optional().isIn(statusValues).withMessage('Status is invalid'),
];
