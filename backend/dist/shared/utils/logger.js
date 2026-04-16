"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const winston_cloudwatch_1 = __importDefault(require("winston-cloudwatch"));
const logGroupName = process.env.CLOUDWATCH_LOG_GROUP || 'TravelNest-Logs';
const logStreamName = `${process.env.NODE_ENV || 'development'}-stream`;
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
        })
    ]
});
if (process.env.NODE_ENV === 'production') {
    const cwConfig = {
        logGroupName,
        logStreamName,
        awsRegion: process.env.AWS_REGION || 'us-east-1',
        messageFormatter: ({ level, message, ...meta }) => `[${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`
    };
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        cwConfig.awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
        cwConfig.awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
    }
    logger.add(new winston_cloudwatch_1.default(cwConfig));
}
exports.default = logger;
//# sourceMappingURL=logger.js.map