import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { getDashboardHandler } from './dashboard.controller';

const router = Router();

router.get('/', authenticate, getDashboardHandler);

export default router;
