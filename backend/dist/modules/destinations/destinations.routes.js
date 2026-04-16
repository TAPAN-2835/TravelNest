"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const destinations_controller_1 = require("./destinations.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const destinations_schema_1 = require("./destinations.schema");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/destinations:
 *   get:
 *     summary: List all destinations
 *     tags: [Destinations]
 */
router.get('/', destinations_controller_1.DestinationsController.getAll);
/**
 * @swagger
 * /api/destinations/trending:
 *   get:
 *     summary: Get trending destinations
 *     tags: [Destinations]
 */
router.get('/trending', destinations_controller_1.DestinationsController.getTrending);
/**
 * @swagger
 * /api/destinations/recommended:
 *   get:
 *     summary: Get recommended destinations for user
 *     tags: [Destinations]
 */
router.get('/recommended', auth_middleware_1.authenticate, destinations_controller_1.DestinationsController.getRecommended);
/**
 * @swagger
 * /api/destinations/:id:
 *   get:
 *     summary: Get single destination
 *     tags: [Destinations]
 */
router.get('/:id', destinations_controller_1.DestinationsController.getById);
/**
 * @swagger
 * /api/destinations:
 *   post:
 *     summary: Create new destination
 *     tags: [Destinations]
 */
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('ADMIN'), (0, validate_middleware_1.validate)(destinations_schema_1.createDestinationSchema), destinations_controller_1.DestinationsController.create);
/**
 * @swagger
 * /api/destinations/:id:
 *   put:
 *     summary: Update destination
 *     tags: [Destinations]
 */
router.put('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('ADMIN'), (0, validate_middleware_1.validate)(destinations_schema_1.updateDestinationSchema), destinations_controller_1.DestinationsController.update);
exports.default = router;
//# sourceMappingURL=destinations.routes.js.map