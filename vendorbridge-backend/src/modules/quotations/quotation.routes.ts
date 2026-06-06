import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
	compareQuotationsHandler,
	createQuotationHandler,
	listQuotationsHandler,
	listAllQuotationsHandler,
	listMyQuotationsHandler,
	updateQuotationHandler,
	updateQuotationStatusHandler,
} from './quotation.controller';
import { createQuotationValidation, updateQuotationValidation } from './quotation.validation';
import { AuthRequest } from '../../middleware/auth.middleware';

const router = Router();

router.post('/rfqs/:rfqId/quotations', authenticate, authorize(UserRole.VENDOR), createQuotationValidation, validate, createQuotationHandler);

router.get('/quotations', authenticate, (req: AuthRequest, res, next) => {
	if (req.user?.role === UserRole.VENDOR) {
		return listMyQuotationsHandler(req, res, next);
	}
	return authorize(UserRole.PROCUREMENT_OFFICER, UserRole.MANAGER, UserRole.ADMIN)(req, res, next);
}, (req: AuthRequest, res, next) => {
	if (req.user?.role !== UserRole.VENDOR) {
		return listAllQuotationsHandler(req, res, next);
	}
});

router.get('/rfqs/:rfqId/quotations', authenticate, authorize(UserRole.PROCUREMENT_OFFICER, UserRole.MANAGER, UserRole.ADMIN), listQuotationsHandler);
router.get('/rfqs/:rfqId/quotations/compare', authenticate, authorize(UserRole.PROCUREMENT_OFFICER, UserRole.MANAGER, UserRole.ADMIN), compareQuotationsHandler);
router.patch('/quotations/:id', authenticate, authorize(UserRole.VENDOR), updateQuotationValidation, validate, updateQuotationHandler);
router.patch('/quotations/:id/status', authenticate, authorize(UserRole.PROCUREMENT_OFFICER, UserRole.MANAGER, UserRole.ADMIN), updateQuotationStatusHandler);

export default router;
