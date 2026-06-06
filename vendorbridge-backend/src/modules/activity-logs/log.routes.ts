import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { getLogsHandler } from './log.controller';

const router = Router();

router.get('/', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), getLogsHandler);

export default router;
