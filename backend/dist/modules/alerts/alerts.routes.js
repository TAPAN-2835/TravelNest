"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alerts_controller_1 = require("./alerts.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const alerts_schema_1 = require("./alerts.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: Get user alerts
 *     tags: [Alerts]
 */
router.get('/', alerts_controller_1.AlertsController.getAll);
/**
 * @swagger
 * /api/alerts/weather:
 *   get:
 *     summary: Get real-time weather alerts for upcoming trips
 *     tags: [Alerts]
 */
router.get('/weather', alerts_controller_1.AlertsController.getWeatherAlerts);
/**
 * @swagger
 * /api/alerts/subscribe:
 *   post:
 *     summary: Subscribe to destination alerts
 *     tags: [Alerts]
 */
router.post('/subscribe', (0, validate_middleware_1.validate)(alerts_schema_1.subscribeAlertsSchema), alerts_controller_1.AlertsController.subscribe);
/**
 * @swagger
 * /api/alerts/:id/read:
 *   patch:
 *     summary: Mark alert as read
 *     tags: [Alerts]
 */
router.patch('/:id/read', alerts_controller_1.AlertsController.markAsRead);
/**
 * @swagger
 * /api/alerts/:id:
 *   delete:
 *     summary: Delete alert
 *     tags: [Alerts]
 */
router.delete('/:id', alerts_controller_1.AlertsController.delete);
/**
 * @swagger
 * /api/alerts/broadcast:
 *   post:
 *     summary: Broadcast alert to multiple trips (Admin)
 *     tags: [Alerts]
 */
router.post('/broadcast', (0, role_middleware_1.authorize)('ADMIN'), (0, validate_middleware_1.validate)(alerts_schema_1.broadcastAlertSchema), alerts_controller_1.AlertsController.broadcast);
exports.default = router;
//# sourceMappingURL=alerts.routes.js.map