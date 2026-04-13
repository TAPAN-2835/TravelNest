import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Dashboard Stats
router.get('/stats', AdminController.getStats);

// Users
router.get('/users', AdminController.getUsers);
router.get('/users/:id', AdminController.getUserById);
router.patch('/users/:id/role', AdminController.updateUserRole);

// Trips
router.get('/trips', AdminController.getTrips);

// Legacy
router.get('/dashboard', AdminController.getDashboard);
router.get('/analytics', AdminController.getAnalytics);

export default router;
