import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createPurchaseOrderHandler, getPurchaseOrderHandler, listPurchaseOrdersHandler, updatePurchaseOrderStatusHandler } from './po.controller';
import { createPoValidation, updatePoStatusValidation } from './po.validation';

const router = Router();

router.post('/', authenticate, authorize(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER), createPoValidation, validate, createPurchaseOrderHandler);
router.get('/', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.PROCUREMENT_OFFICER, UserRole.VENDOR), listPurchaseOrdersHandler);
router.get('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.PROCUREMENT_OFFICER), getPurchaseOrderHandler);
router.patch('/:id/status', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.PROCUREMENT_OFFICER), updatePoStatusValidation, validate, updatePurchaseOrderStatusHandler);

export default router;
