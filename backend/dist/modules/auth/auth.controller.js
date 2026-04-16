"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const response_utils_1 = require("../../shared/utils/response.utils");
class AuthController {
    static async register(req, res, next) {
        try {
            const data = await auth_service_1.AuthService.register(req.body);
            (0, response_utils_1.sendSuccess)(res, 'User registered successfully', data, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const data = await auth_service_1.AuthService.login(req.body);
            (0, response_utils_1.sendSuccess)(res, 'Login successful', data);
        }
        catch (error) {
            next(error);
        }
    }
    static async refresh(req, res, next) {
        try {
            const data = await auth_service_1.AuthService.refreshToken(req.body.refreshToken);
            (0, response_utils_1.sendSuccess)(res, 'Token refreshed successfully', data);
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            await auth_service_1.AuthService.logout(req.body.refreshToken);
            (0, response_utils_1.sendSuccess)(res, 'Logged out successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async forgotPassword(req, res, next) {
        try {
            await auth_service_1.AuthService.forgotPassword(req.body.email);
            (0, response_utils_1.sendSuccess)(res, 'Password reset email sent');
        }
        catch (error) {
            next(error);
        }
    }
    static async resetPassword(req, res, next) {
        try {
            await auth_service_1.AuthService.resetPassword(req.body.token, req.body.newPassword);
            (0, response_utils_1.sendSuccess)(res, 'Password reset successful');
        }
        catch (error) {
            next(error);
        }
    }
    static async me(req, res, next) {
        try {
            (0, response_utils_1.sendSuccess)(res, 'Current user profile fetched', req.user);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map