import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
	compareQuotationsHandler,
	createQuotationHandler,
	listQuotationsHandler,
	updateQuotationHandler,
} from './quotation.controller';
import { createQuotationValidation, updateQuotationValidation } from './quotation.validation';

const router = Router();

router.post('/rfqs/:rfqId/quotations', authenticate, authorize(UserRole.VENDOR), createQuotationValidation, validate, createQuotationHandler);
router.get('/rfqs/:rfqId/quotations', authenticate, authorize(UserRole.PROCUREMENT_OFFICER, UserRole.MANAGER, UserRole.ADMIN), listQuotationsHandler);
router.get('/rfqs/:rfqId/quotations/compare', authenticate, authorize(UserRole.PROCUREMENT_OFFICER, UserRole.MANAGER, UserRole.ADMIN), compareQuotationsHandler);
router.patch('/quotations/:id', authenticate, authorize(UserRole.VENDOR), updateQuotationValidation, validate, updateQuotationHandler);

export default router;
