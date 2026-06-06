import { UserRole } from '@prisma/client';
import { body } from 'express-validator';

const roleValues = Object.values(UserRole);

export const registerValidation = [
	body('firstName').trim().notEmpty().withMessage('First name is required'),
	body('lastName').trim().notEmpty().withMessage('Last name is required'),
	body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
	body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
	body('role').isIn(roleValues).withMessage('Role is invalid'),
	body('phone').optional().isString(),
	body('country').optional().isString(),
	body('companyName').optional().isString(),
	body('gstNumber').optional().isString(),
	body('additionalInfo').optional().isString(),
];

export const loginValidation = [
	body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
	body('password').notEmpty().withMessage('Password is required'),
];
