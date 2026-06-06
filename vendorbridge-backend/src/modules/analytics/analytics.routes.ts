import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { getAnalyticsHandler } from './analytics.controller';

const router = Router();

router.get('/', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.PROCUREMENT_OFFICER), getAnalyticsHandler);

export default router;
