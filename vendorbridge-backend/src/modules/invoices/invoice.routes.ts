import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createInvoiceHandler, emailInvoiceHandler, getInvoiceHandler, getInvoicePdfHandler, updateInvoiceStatusHandler } from './invoice.controller';
import { createInvoiceValidation, emailInvoiceValidation, updateInvoiceStatusValidation } from './invoice.validation';

const router = Router();

router.post('/', authenticate, authorize(UserRole.PROCUREMENT_OFFICER), createInvoiceValidation, validate, createInvoiceHandler);
router.get('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.PROCUREMENT_OFFICER), getInvoiceHandler);
router.get('/:id/pdf', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.PROCUREMENT_OFFICER), getInvoicePdfHandler);
router.post('/:id/email', authenticate, authorize(UserRole.PROCUREMENT_OFFICER), emailInvoiceValidation, validate, emailInvoiceHandler);
router.patch('/:id/status', authenticate, authorize(UserRole.PROCUREMENT_OFFICER, UserRole.ADMIN, UserRole.MANAGER), updateInvoiceStatusValidation, validate, updateInvoiceStatusHandler);

export default router;
