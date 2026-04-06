import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { upload } from '../../middlewares/upload.middleware';
import { updateProfileSchema } from './users.schema';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 */
router.get('/profile', UsersController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 */
router.put('/profile', validate(updateProfileSchema), UsersController.updateProfile);

/**
 * @swagger
 * /api/users/avatar:
 *   put:
 *     summary: Update user avatar
 *     tags: [Users]
 */
router.put('/avatar', upload.single('image'), UsersController.updateAvatar);

/**
 * @swagger
 * /api/users/account:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 */
router.delete('/account', UsersController.deleteAccount);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user travel stats
 *     tags: [Users]
 */
router.get('/stats', UsersController.getStats);

export default router;
