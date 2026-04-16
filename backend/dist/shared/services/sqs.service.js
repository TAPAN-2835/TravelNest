"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQSService = void 0;
const client_sqs_1 = require("@aws-sdk/client-sqs");
const aws_1 = require("../../config/aws");
class SQSService {
    static getQueueUrl(queueName) {
        const accountId = process.env.AWS_ACCOUNT_ID;
        const region = process.env.AWS_REGION || 'us-east-1';
        return `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`;
    }
    static async sendMessage(queueName, messageBody) {
        try {
            const command = new client_sqs_1.SendMessageCommand({
                QueueUrl: this.getQueueUrl(queueName),
                MessageBody: JSON.stringify(messageBody),
            });
            const response = await aws_1.sqsClient.send(command);
            console.log(`[SQS] Message sent to ${queueName}:`, response.MessageId);
            return response;
        }
        catch (error) {
            console.error(`[SQS] Error sending message to ${queueName}:`, error);
            throw error;
        }
    }
}
exports.SQSService = SQSService;
//# sourceMappingURL=sqs.service.js.map