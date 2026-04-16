"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("./users.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const upload_middleware_1 = require("../../middlewares/upload.middleware");
const users_schema_1 = require("./users.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 */
router.get('/profile', users_controller_1.UsersController.getProfile);
/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 */
router.put('/profile', (0, validate_middleware_1.validate)(users_schema_1.updateProfileSchema), users_controller_1.UsersController.updateProfile);
/**
 * @swagger
 * /api/users/avatar:
 *   put:
 *     summary: Update user avatar
 *     tags: [Users]
 */
router.put('/avatar', upload_middleware_1.upload.single('image'), users_controller_1.UsersController.updateAvatar);
/**
 * @swagger
 * /api/users/account:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 */
router.delete('/account', users_controller_1.UsersController.deleteAccount);
/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user travel stats
 *     tags: [Users]
 */
router.get('/stats', users_controller_1.UsersController.getStats);
exports.default = router;
//# sourceMappingURL=users.routes.js.map