"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const auth_schema_1 = require("./auth.schema");
const passport_1 = __importDefault(require("passport"));
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 */
router.post('/register', (0, validate_middleware_1.validate)(auth_schema_1.registerSchema), auth_controller_1.AuthController.register);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 */
router.post('/login', (0, validate_middleware_1.validate)(auth_schema_1.loginSchema), auth_controller_1.AuthController.login);
/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 */
router.post('/refresh', (0, validate_middleware_1.validate)(auth_schema_1.refreshTokenSchema), auth_controller_1.AuthController.refresh);
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 */
router.post('/logout', auth_controller_1.AuthController.logout);
/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 */
router.post('/forgot-password', (0, validate_middleware_1.validate)(auth_schema_1.forgotPasswordSchema), auth_controller_1.AuthController.forgotPassword);
/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 */
router.post('/reset-password', (0, validate_middleware_1.validate)(auth_schema_1.resetPasswordSchema), auth_controller_1.AuthController.resetPassword);
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.AuthController.me);
router.get('/google', passport_1.default.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
}));
router.get('/google/callback', passport_1.default.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
}), async (req, res) => {
    try {
        const user = req.user;
        const { signAccessToken, signRefreshToken } = require('../../shared/utils/jwt.utils');
        const { prisma } = require('../../config/database');
        const accessToken = signAccessToken(user.id, user.role);
        const refreshToken = signRefreshToken(user.id);
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        res.redirect(`${process.env.FRONTEND_URL}/dashboard?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    }
    catch (error) {
        res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map