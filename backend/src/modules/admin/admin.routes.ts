import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard data
 *     tags: [Admin]
 */
router.get('/dashboard', AdminController.getDashboard);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 */
router.get('/users', AdminController.getUsers);

/**
 * @swagger
 * /api/admin/users/:id/role:
 *   patch:
 *     summary: Update user role
 *     tags: [Admin]
 */
router.patch('/users/:id/role', AdminController.updateUserRole);

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get platform analytics
 *     tags: [Admin]
 */
router.get('/analytics', AdminController.getAnalytics);

export default router;
