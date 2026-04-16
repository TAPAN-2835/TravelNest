"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const itinerary_controller_1 = require("./itinerary.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const itinerary_schema_1 = require("./itinerary.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
/**
 * @swagger
 * /api/itinerary/generate:
 *   post:
 *     summary: Generate a new AI itinerary
 *     tags: [Itinerary]
 */
router.post('/generate', (0, validate_middleware_1.validate)(itinerary_schema_1.generateItinerarySchema), itinerary_controller_1.ItineraryController.generate);
/**
 * @swagger
 * /api/itinerary/:tripId:
 *   get:
 *     summary: Get itinerary for a trip
 *     tags: [Itinerary]
 */
router.get('/:tripId', itinerary_controller_1.ItineraryController.getByTripId);
/**
 * @swagger
 * /api/itinerary/:tripId/day/:dayNumber:
 *   put:
 *     summary: Update a specific day in the itinerary
 *     tags: [Itinerary]
 */
router.put('/:tripId/day/:dayNumber', (0, validate_middleware_1.validate)(itinerary_schema_1.updateItineraryDaySchema), itinerary_controller_1.ItineraryController.updateDay);
/**
 * @swagger
 * /api/itinerary/:tripId:
 *   delete:
 *     summary: Delete an itinerary
 *     tags: [Itinerary]
 */
router.delete('/:tripId', itinerary_controller_1.ItineraryController.delete);
/**
 * @swagger
 * /api/itinerary/:tripId/regenerate:
 *   post:
 *     summary: Regenerate itinerary with feedback
 *     tags: [Itinerary]
 */
router.post('/:tripId/regenerate', (0, validate_middleware_1.validate)(itinerary_schema_1.regenerateItinerarySchema), itinerary_controller_1.ItineraryController.regenerate);
exports.default = router;
//# sourceMappingURL=itinerary.routes.js.map