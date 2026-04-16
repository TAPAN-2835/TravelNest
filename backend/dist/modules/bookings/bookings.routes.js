"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookings_controller_1 = require("./bookings.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const bookings_schema_1 = require("./bookings.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: List all user bookings
 *     tags: [Bookings]
 */
router.get('/', bookings_controller_1.BookingsController.getAll);
/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create new booking
 *     tags: [Bookings]
 */
router.post('/', (0, validate_middleware_1.validate)(bookings_schema_1.createBookingSchema), bookings_controller_1.BookingsController.create);
/**
 * @swagger
 * /api/bookings/:id:
 *   get:
 *     summary: Get booking details
 *     tags: [Bookings]
 */
router.get('/:id', bookings_controller_1.BookingsController.getById);
/**
 * @swagger
 * /api/bookings/:id:
 *   put:
 *     summary: Update booking
 *     tags: [Bookings]
 */
router.put('/:id', (0, validate_middleware_1.validate)(bookings_schema_1.updateBookingSchema), bookings_controller_1.BookingsController.update);
/**
 * @swagger
 * /api/bookings/:id:
 *   delete:
 *     summary: Cancel booking
 *     tags: [Bookings]
 */
router.delete('/:id', bookings_controller_1.BookingsController.cancel);
exports.default = router;
//# sourceMappingURL=bookings.routes.js.map