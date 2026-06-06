import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
	createVendorHandler,
	deleteVendorHandler,
	getAllVendors,
	getVendorHandler,
	updateVendorHandler,
} from './vendor.controller';
import { createVendorValidation, updateVendorValidation } from './vendor.validation';

const router = Router();

router.get('/', authenticate, authorize(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER, UserRole.MANAGER), getAllVendors);
router.post('/', authenticate, authorize(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER), createVendorValidation, validate, createVendorHandler);
router.get('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER, UserRole.MANAGER), getVendorHandler);
router.patch('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER), updateVendorValidation, validate, updateVendorHandler);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteVendorHandler);

export default router;
