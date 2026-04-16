"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsController = void 0;
const bookings_service_1 = require("./bookings.service");
const response_utils_1 = require("../../shared/utils/response.utils");
class BookingsController {
    static async getAll(req, res, next) {
        try {
            const bookings = await bookings_service_1.BookingsService.getAll(req.user.id, req.query);
            (0, response_utils_1.sendSuccess)(res, 'Bookings fetched successfully', bookings);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const booking = await bookings_service_1.BookingsService.create(req.user.id, req.body);
            (0, response_utils_1.sendSuccess)(res, 'Booking created successfully', booking, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const booking = await bookings_service_1.BookingsService.getById(req.user.id, req.params.id);
            (0, response_utils_1.sendSuccess)(res, 'Booking details fetched', booking);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const booking = await bookings_service_1.BookingsService.update(req.user.id, req.params.id, req.body);
            (0, response_utils_1.sendSuccess)(res, 'Booking updated successfully', booking);
        }
        catch (error) {
            next(error);
        }
    }
    static async cancel(req, res, next) {
        try {
            const booking = await bookings_service_1.BookingsService.cancel(req.user.id, req.params.id);
            (0, response_utils_1.sendSuccess)(res, 'Booking cancelled successfully', booking);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.BookingsController = BookingsController;
//# sourceMappingURL=bookings.controller.js.map