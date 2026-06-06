import { body } from 'express-validator';

export const createInvoiceValidation = [
  body('purchaseOrderId').notEmpty().withMessage('Purchase order id is required'),
  body('dueDate').isISO8601().withMessage('Due date must be a valid date'),
  body('taxRate').optional().isFloat({ gt: 0 }).withMessage('Tax rate must be greater than 0'),
];

export const emailInvoiceValidation = [
  body('recipientEmail').isEmail().withMessage('Recipient email must be valid'),
];

export const updateInvoiceStatusValidation = [
  body('status').isIn(['SENT', 'PAID']).withMessage('Status is invalid'),
];