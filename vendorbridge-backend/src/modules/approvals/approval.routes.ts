import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { approveHandler, createApprovalHandler, getApprovalHandler, rejectHandler } from './approval.controller';
import { createApprovalValidation, decisionValidation, rejectValidation } from './approval.validation';

const router = Router();

router.post('/', authenticate, authorize(UserRole.PROCUREMENT_OFFICER), createApprovalValidation, validate, createApprovalHandler);
router.get('/:id', authenticate, getApprovalHandler);
router.post('/:id/approve', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), decisionValidation, validate, approveHandler);
router.post('/:id/reject', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), rejectValidation, validate, rejectHandler);

export default router;
