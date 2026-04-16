"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("./admin.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const router = (0, express_1.Router)();
// All admin routes require authentication + ADMIN role
router.use(auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('ADMIN'));
// Dashboard Stats
router.get('/stats', admin_controller_1.AdminController.getStats);
// Users
router.get('/users', admin_controller_1.AdminController.getUsers);
router.get('/users/:id', admin_controller_1.AdminController.getUserById);
router.patch('/users/:id/role', admin_controller_1.AdminController.updateUserRole);
// Trips
router.get('/trips', admin_controller_1.AdminController.getTrips);
// Legacy
router.get('/dashboard', admin_controller_1.AdminController.getDashboard);
router.get('/analytics', admin_controller_1.AdminController.getAnalytics);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map