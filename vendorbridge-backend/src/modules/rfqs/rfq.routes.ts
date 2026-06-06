import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
	closeRfqHandler,
	createRfqHandler,
	getRfqHandler,
	listRfqHandler,
	publishRfqHandler,
	approveRfqHandler,
} from './rfq.controller';
import { createRfqValidation } from './rfq.validation';

const router = Router();

router.post('/', authenticate, authorize(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER), createRfqValidation, validate, createRfqHandler);
router.post('/:id/approve', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), approveRfqHandler);
router.get('/', authenticate, listRfqHandler);
router.get('/:id', authenticate, getRfqHandler);
router.post('/:id/publish', authenticate, authorize(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER), publishRfqHandler);
router.post('/:id/close', authenticate, authorize(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER), closeRfqHandler);

export default router;
