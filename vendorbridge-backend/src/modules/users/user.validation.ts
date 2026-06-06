import { UserRole } from '@prisma/client';
import { body, query, param } from 'express-validator';

const roleValues = Object.values(UserRole);

export const listUsersValidation = [
	query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
	query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
	query('search').optional().isString().trim(),
	query('role').optional().isIn(roleValues).withMessage('Invalid role filter'),
];

export const createUserValidation = [
	body('firstName').trim().notEmpty().withMessage('First name is required'),
	body('lastName').trim().notEmpty().withMessage('Last name is required'),
	body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
	body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
	body('role').isIn(roleValues).withMessage('Role is invalid'),
	body('phone').optional().isString(),
	body('country').optional().isString(),
	body('additionalInfo').optional().isString(),
	body('vendorId').optional().isString(),
];

export const updateUserValidation = [
	param('id').isString().notEmpty().withMessage('User ID is required'),
	body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
	body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
	body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
	body('role').optional().isIn(roleValues).withMessage('Role is invalid'),
	body('phone').optional().isString(),
	body('country').optional().isString(),
	body('additionalInfo').optional().isString(),
	body('vendorId').optional().isString(),
];

export const deleteUserValidation = [
	param('id').isString().notEmpty().withMessage('User ID is required'),
];
