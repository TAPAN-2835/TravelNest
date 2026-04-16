"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripsController = void 0;
const trips_service_1 = require("./trips.service");
const response_utils_1 = require("../../shared/utils/response.utils");
class TripsController {
    static async getAll(req, res, next) {
        try {
            const trips = await trips_service_1.TripsService.getAll(req.user.id, req.query);
            (0, response_utils_1.sendSuccess)(res, 'Trips fetched successfully', trips);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const trip = await trips_service_1.TripsService.create(req.user.id, req.body);
            (0, response_utils_1.sendSuccess)(res, 'Trip created successfully', trip, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async saveGenerated(req, res, next) {
        try {
            const trip = await trips_service_1.TripsService.saveGeneratedTrip(req.user.id, req.body);
            (0, response_utils_1.sendSuccess)(res, 'Generated Trip saved successfully', trip, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const trip = await trips_service_1.TripsService.getById(req.user.id, req.params.id);
            (0, response_utils_1.sendSuccess)(res, 'Trip details fetched', trip);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const trip = await trips_service_1.TripsService.update(req.user.id, req.params.id, req.body);
            (0, response_utils_1.sendSuccess)(res, 'Trip updated successfully', trip);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            await trips_service_1.TripsService.delete(req.user.id, req.params.id);
            (0, response_utils_1.sendSuccess)(res, 'Trip deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async updateStatus(req, res, next) {
        try {
            const trip = await trips_service_1.TripsService.updateStatus(req.user.id, req.params.id, req.body.status);
            (0, response_utils_1.sendSuccess)(res, 'Trip status updated', trip);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TripsController = TripsController;
//# sourceMappingURL=trips.controller.js.map