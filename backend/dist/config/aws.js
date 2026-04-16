"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedulerClient = exports.cwClient = exports.sqsClient = exports.sesClient = exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const client_ses_1 = require("@aws-sdk/client-ses");
const client_sqs_1 = require("@aws-sdk/client-sqs");
const client_cloudwatch_logs_1 = require("@aws-sdk/client-cloudwatch-logs");
const client_scheduler_1 = require("@aws-sdk/client-scheduler");
const config = {
    region: process.env.AWS_REGION || 'us-east-1',
};
// Only add credentials if explicitly provided (e.g., local development)
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
}
exports.s3Client = new client_s3_1.S3Client(config);
exports.sesClient = new client_ses_1.SESClient(config);
exports.sqsClient = new client_sqs_1.SQSClient(config);
exports.cwClient = new client_cloudwatch_logs_1.CloudWatchLogsClient(config);
exports.schedulerClient = new client_scheduler_1.SchedulerClient(config);
//# sourceMappingURL=aws.js.map