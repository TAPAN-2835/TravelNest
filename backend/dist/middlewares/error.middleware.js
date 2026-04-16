"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const response_utils_1 = require("../shared/utils/response.utils");
const winston_1 = __importDefault(require("winston"));
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';
    if (process.env.NODE_ENV === 'development') {
        console.error(err);
    }
    else {
        winston_1.default.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    }
    // Prisma Error Handling
    if (err.code === 'P2002') {
        return (0, response_utils_1.sendError)(res, 'Record already exists', 409);
    }
    if (err.code === 'P2025') {
        return (0, response_utils_1.sendError)(res, 'Record not found', 404);
    }
    // JWT Error Handling
    if (err.name === 'JsonWebTokenError') {
        return (0, response_utils_1.sendError)(res, 'Invalid token', 401);
    }
    if (err.name === 'TokenExpiredError') {
        return (0, response_utils_1.sendError)(res, 'Token expired', 401);
    }
    return (0, response_utils_1.sendError)(res, err.message, err.statusCode, err.errors || []);
};
exports.globalErrorHandler = globalErrorHandler;
//# sourceMappingURL=error.middleware.js.map