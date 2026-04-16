"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItineraryController = void 0;
const itinerary_service_1 = require("./itinerary.service");
const response_utils_1 = require("../../shared/utils/response.utils");
class ItineraryController {
    static async generate(req, res, next) {
        try {
            const itinerary = await itinerary_service_1.ItineraryService.generate(req.user.id, req.body);
            (0, response_utils_1.sendSuccess)(res, 'Itinerary generated successfully', itinerary, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async getByTripId(req, res, next) {
        try {
            const itinerary = await itinerary_service_1.ItineraryService.getByTripId(req.params.tripId);
            (0, response_utils_1.sendSuccess)(res, 'Itinerary details fetched', itinerary);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateDay(req, res, next) {
        try {
            const itinerary = await itinerary_service_1.ItineraryService.updateDay(req.params.tripId, Number(req.params.dayNumber), req.body);
            (0, response_utils_1.sendSuccess)(res, 'Itinerary day updated', itinerary);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            await itinerary_service_1.ItineraryService.delete(req.params.tripId);
            (0, response_utils_1.sendSuccess)(res, 'Itinerary deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async regenerate(req, res, next) {
        try {
            const itinerary = await itinerary_service_1.ItineraryService.regenerate(req.user.id, req.params.tripId, req.body.feedback);
            (0, response_utils_1.sendSuccess)(res, 'Itinerary regenerated successfully', itinerary);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ItineraryController = ItineraryController;
//# sourceMappingURL=itinerary.controller.js.map