import { body } from 'express-validator';

export const createPoValidation = [
  body('quotationId').notEmpty().withMessage('Quotation id is required'),
  body('deliveryDate').isISO8601().withMessage('Delivery date must be a valid date'),
  body('terms').optional().isString(),
  body('taxRate').optional().isFloat({ gt: 0 }).withMessage('Tax rate must be greater than 0'),
];

export const updatePoStatusValidation = [
  body('status').isIn(['CONFIRMED', 'DELIVERED', 'CANCELLED']).withMessage('Status is invalid'),
];