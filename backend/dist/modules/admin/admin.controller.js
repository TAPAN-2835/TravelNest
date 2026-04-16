"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = require("./admin.service");
const response_utils_1 = require("../../shared/utils/response.utils");
class AdminController {
    static async getStats(req, res, next) {
        try {
            const data = await admin_service_1.AdminService.getStats();
            (0, response_utils_1.sendSuccess)(res, 'Stats fetched successfully', data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getUsers(req, res, next) {
        try {
            const result = await admin_service_1.AdminService.getUsers(req.query);
            (0, response_utils_1.sendSuccess)(res, 'Users fetched successfully', result.users, 200, {
                total: result.total, page: result.page, limit: result.limit,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getUserById(req, res, next) {
        try {
            const user = await admin_service_1.AdminService.getUserById(req.params.id);
            (0, response_utils_1.sendSuccess)(res, 'User fetched successfully', user);
        }
        catch (error) {
            next(error);
        }
    }
    static async getTrips(req, res, next) {
        try {
            const result = await admin_service_1.AdminService.getTrips(req.query);
            (0, response_utils_1.sendSuccess)(res, 'Trips fetched successfully', result.trips, 200, {
                total: result.total, page: result.page, limit: result.limit,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // ── Legacy ────────────────────────────────────────────────────────────────
    static async getDashboard(req, res, next) {
        try {
            const data = await admin_service_1.AdminService.getDashboard();
            (0, response_utils_1.sendSuccess)(res, 'Dashboard data fetched', data);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateUserRole(req, res, next) {
        try {
            const user = await admin_service_1.AdminService.updateUserRole(req.params.id, req.body.role);
            (0, response_utils_1.sendSuccess)(res, 'User role updated', user);
        }
        catch (error) {
            next(error);
        }
    }
    static async getAnalytics(req, res, next) {
        try {
            const data = await admin_service_1.AdminService.getAnalytics();
            (0, response_utils_1.sendSuccess)(res, 'Analytics fetched', data);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map