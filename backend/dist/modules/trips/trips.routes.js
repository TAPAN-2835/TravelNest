"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trips_controller_1 = require("./trips.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const trips_schema_1 = require("./trips.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: List all user trips
 *     tags: [Trips]
 */
router.get('/', trips_controller_1.TripsController.getAll);
/**
 * @swagger
 * /api/trips:
 *   post:
 *     summary: Create new trip
 *     tags: [Trips]
 */
router.post('/', (0, validate_middleware_1.validate)(trips_schema_1.createTripSchema), trips_controller_1.TripsController.create);
/**
 * @swagger
 * /api/trips/save:
 *   post:
 *     summary: Create new trip and store itinerary data
 *     tags: [Trips]
 */
router.post('/save', trips_controller_1.TripsController.saveGenerated);
/**
 * @swagger
 * /api/trips/:id:
 *   get:
 *     summary: Get trip details
 *     tags: [Trips]
 */
router.get('/:id', trips_controller_1.TripsController.getById);
/**
 * @swagger
 * /api/trips/:id:
 *   put:
 *     summary: Update trip
 *     tags: [Trips]
 */
router.put('/:id', (0, validate_middleware_1.validate)(trips_schema_1.updateTripSchema), trips_controller_1.TripsController.update);
/**
 * @swagger
 * /api/trips/:id:
 *   delete:
 *     summary: Delete trip
 *     tags: [Trips]
 */
router.delete('/:id', trips_controller_1.TripsController.delete);
/**
 * @swagger
 * /api/trips/:id/status:
 *   patch:
 *     summary: Update trip status
 *     tags: [Trips]
 */
router.patch('/:id/status', (0, validate_middleware_1.validate)(trips_schema_1.updateTripStatusSchema), trips_controller_1.TripsController.updateStatus);
exports.default = router;
//# sourceMappingURL=trips.routes.js.map