"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode, errors) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const sendSuccess = (res, message, data = {}, statusCode = 200, pagination = null) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        ...(pagination && { pagination }),
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 500, errors = []) => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(errors.length > 0 && { errors }),
    });
};
exports.sendError = sendError;
//# sourceMappingURL=response.utils.js.map