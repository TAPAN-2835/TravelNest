"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const users_service_1 = require("./users.service");
const response_utils_1 = require("../../shared/utils/response.utils");
class UsersController {
    static async getProfile(req, res, next) {
        try {
            const user = await users_service_1.UsersService.getProfile(req.user.id);
            (0, response_utils_1.sendSuccess)(res, 'Profile fetched successfully', user);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateProfile(req, res, next) {
        try {
            const user = await users_service_1.UsersService.updateProfile(req.user.id, req.body);
            (0, response_utils_1.sendSuccess)(res, 'Profile updated successfully', user);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateAvatar(req, res, next) {
        try {
            if (!req.file)
                return next(new Error('No file uploaded'));
            const data = await users_service_1.UsersService.updateAvatar(req.user.id, req.file.originalname, req.file.mimetype);
            (0, response_utils_1.sendSuccess)(res, 'Avatar upload initiated', data);
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteAccount(req, res, next) {
        try {
            await users_service_1.UsersService.deleteAccount(req.user.id);
            (0, response_utils_1.sendSuccess)(res, 'Account deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async getStats(req, res, next) {
        try {
            const stats = await users_service_1.UsersService.getStats(req.user.id);
            (0, response_utils_1.sendSuccess)(res, 'User stats fetched successfully', stats);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map