"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsController = void 0;
const alerts_service_1 = require("./alerts.service");
const response_utils_1 = require("../../shared/utils/response.utils");
class AlertsController {
    static async getAll(req, res, next) {
        try {
            const alerts = await alerts_service_1.AlertsService.getAll(req.user.id, req.query);
            (0, response_utils_1.sendSuccess)(res, 'Alerts fetched successfully', alerts);
        }
        catch (error) {
            next(error);
        }
    }
    static async getWeatherAlerts(req, res, next) {
        try {
            const alerts = await alerts_service_1.AlertsService.getWeatherAlerts(req.user.id);
            (0, response_utils_1.sendSuccess)(res, 'Weather alerts fetched successfully', alerts);
        }
        catch (error) {
            next(error);
        }
    }
    static async subscribe(req, res, next) {
        try {
            await alerts_service_1.AlertsService.subscribe(req.user.id, req.body.tripId);
            (0, response_utils_1.sendSuccess)(res, 'Subscribed to alerts successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async markAsRead(req, res, next) {
        try {
            const alert = await alerts_service_1.AlertsService.markAsRead(req.user.id, req.params.id);
            (0, response_utils_1.sendSuccess)(res, 'Alert marked as read', alert);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            await alerts_service_1.AlertsService.delete(req.user.id, req.params.id);
            (0, response_utils_1.sendSuccess)(res, 'Alert deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async broadcast(req, res, next) {
        try {
            const alerts = await alerts_service_1.AlertsService.broadcast(req.body.tripIds, {
                title: req.body.title,
                message: req.body.message,
                type: req.body.type,
                severity: req.body.severity,
            });
            (0, response_utils_1.sendSuccess)(res, 'Alerts broadcasted successfully', alerts);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AlertsController = AlertsController;
//# sourceMappingURL=alerts.controller.js.map