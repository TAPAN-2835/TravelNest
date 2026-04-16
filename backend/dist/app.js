"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_config_1 = __importDefault(require("./swagger.config"));
const error_middleware_1 = require("./middlewares/error.middleware");
const rateLimit_middleware_1 = require("./middlewares/rateLimit.middleware");
// Routes
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const users_routes_1 = __importDefault(require("./modules/users/users.routes"));
const destinations_routes_1 = __importDefault(require("./modules/destinations/destinations.routes"));
const trips_routes_1 = __importDefault(require("./modules/trips/trips.routes"));
const itinerary_routes_1 = __importDefault(require("./modules/itinerary/itinerary.routes"));
const bookings_routes_1 = __importDefault(require("./modules/bookings/bookings.routes"));
const budget_routes_1 = __importDefault(require("./modules/budget/budget.routes"));
const reviews_routes_1 = __importDefault(require("./modules/reviews/reviews.routes"));
const documents_routes_1 = __importDefault(require("./modules/documents/documents.routes"));
const alerts_routes_1 = __importDefault(require("./modules/alerts/alerts.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const ai_routes_1 = __importDefault(require("./modules/ai/ai.routes"));
const app = (0, express_1.default)();
// Middlewares
app.use((0, helmet_1.default)());
const allowedOrigins = [
    'http://localhost',
    'http://localhost:8080',
    process.env.FRONTEND_URL
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
app.use('/api', rateLimit_middleware_1.limiter);
// Swagger
const specs = (0, swagger_jsdoc_1.default)(swagger_config_1.default);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
// Route Registration
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', users_routes_1.default);
app.use('/api/destinations', destinations_routes_1.default);
app.use('/api/trips', trips_routes_1.default);
app.use('/api/itinerary', itinerary_routes_1.default);
app.use('/api/bookings', bookings_routes_1.default);
app.use('/api/budget', budget_routes_1.default);
app.use('/api/reviews', reviews_routes_1.default);
app.use('/api/documents', documents_routes_1.default);
app.use('/api/alerts', alerts_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
// Health Check
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));
// Global Error Handler
app.use(error_middleware_1.globalErrorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map