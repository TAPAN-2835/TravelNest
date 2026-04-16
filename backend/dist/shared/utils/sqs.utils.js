"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageToQueue = void 0;
const client_sqs_1 = require("@aws-sdk/client-sqs");
const logger_1 = __importDefault(require("./logger"));
const sqsClient = new client_sqs_1.SQSClient({
    region: process.env.AWS_REGION || 'ap-south-1',
});
/**
 * ============================================================================
 * 🔹 SQS + LAMBDA ASYNCHRONOUS NOTIFICATION FLOW
 * ============================================================================
 * Flow: Backend API -> AWS SQS (Queue) -> AWS Lambda -> AWS SES (Email)
 *
 * Why?
 * This prevents the main Node.js event loop from blocking while attempting
 * external email dispatch. Elastic scale is achieved because SQS safely buffers
 * spikes in user activity, and Lambda spins up automatically to process them.
 *
 * Payload shape:
 *   { type: "EMAIL", to: string, subject: string, message: string }
 */
const sendMessageToQueue = async (payload) => {
    const queueUrl = process.env.SQS_QUEUE_URL;
    if (!queueUrl) {
        logger_1.default.warn('SQS_QUEUE_URL not set — skipping notification dispatch.');
        return false;
    }
    try {
        const command = new client_sqs_1.SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(payload),
        });
        const response = await sqsClient.send(command);
        logger_1.default.info(`[SQS] Message dispatched | MessageId: ${response.MessageId} | to: ${payload.to}`);
        return true;
    }
    catch (error) {
        logger_1.default.error('[SQS] Failed to send message:', error);
        return false; // Fail silently — don't break the trip-save transaction
    }
};
exports.sendMessageToQueue = sendMessageToQueue;
//# sourceMappingURL=sqs.utils.js.map