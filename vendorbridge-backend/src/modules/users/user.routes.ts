import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { UserRole } from '@prisma/client';
import * as userController from './user.controller';
import * as userValidation from './user.validation';

const router = Router();

// All user management routes require ADMIN role
router.use(authenticate, authorize(UserRole.ADMIN));

router.get(
	'/',
	userValidation.listUsersValidation,
	validate,
	userController.getAllUsers
);

router.get(
	'/:id',
	userController.getUser
);

router.post(
	'/',
	userValidation.createUserValidation,
	validate,
	userController.createNewUser
);

router.patch(
	'/:id',
	userValidation.updateUserValidation,
	validate,
	userController.updateExistingUser
);

router.delete(
	'/:id',
	userValidation.deleteUserValidation,
	validate,
	userController.removeUser
);

export default router;
