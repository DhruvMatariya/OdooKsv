import { UserRole } from '@prisma/client';
import { body } from 'express-validator';

const roleValues = Object.values(UserRole);

export const registerValidation = [
	body('name').trim().notEmpty().withMessage('Name is required'),
	body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
	body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
	body('role').isIn(roleValues).withMessage('Role is invalid'),
];

export const loginValidation = [
	body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
	body('password').notEmpty().withMessage('Password is required'),
];
