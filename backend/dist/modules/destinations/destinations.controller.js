"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DestinationsController = void 0;
const destinations_service_1 = require("./destinations.service");
const response_utils_1 = require("../../shared/utils/response.utils");
class DestinationsController {
    static async getAll(req, res, next) {
        try {
            const data = await destinations_service_1.DestinationsService.getAll(req.query);
            (0, response_utils_1.sendSuccess)(res, 'Destinations fetched successfully', data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const destination = await destinations_service_1.DestinationsService.getById(req.params.id);
            if (!destination)
                return next(new Error('Destination not found'));
            (0, response_utils_1.sendSuccess)(res, 'Destination fetched successfully', destination);
        }
        catch (error) {
            next(error);
        }
    }
    static async getTrending(req, res, next) {
        try {
            const trending = await destinations_service_1.DestinationsService.getTrending();
            (0, response_utils_1.sendSuccess)(res, 'Trending destinations fetched', trending);
        }
        catch (error) {
            next(error);
        }
    }
    static async getRecommended(req, res, next) {
        try {
            const user = await req.user; // Simplified, ideally fetch user from DB
            const recommended = await destinations_service_1.DestinationsService.getRecommended(req.user.role === 'USER' ? [] : []); // Logic based on travel style
            (0, response_utils_1.sendSuccess)(res, 'Recommended destinations fetched', recommended);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const destination = await destinations_service_1.DestinationsService.create(req.body);
            (0, response_utils_1.sendSuccess)(res, 'Destination created successfully', destination, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const destination = await destinations_service_1.DestinationsService.update(req.params.id, req.body);
            (0, response_utils_1.sendSuccess)(res, 'Destination updated successfully', destination);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DestinationsController = DestinationsController;
//# sourceMappingURL=destinations.controller.js.map