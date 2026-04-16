import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import logger from './logger';

const sqsClient = new SQSClient({
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
export const sendMessageToQueue = async (payload: {
  type: string;
  to: string;
  subject: string;
  message: string;
}): Promise<boolean> => {
  const queueUrl = process.env.SQS_QUEUE_URL;

  if (!queueUrl) {
    logger.warn('SQS_QUEUE_URL not set — skipping notification dispatch.');
    return false;
  }

  try {
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(payload),
    });

    const response = await sqsClient.send(command);
    logger.info(`[SQS] Message dispatched | MessageId: ${response.MessageId} | to: ${payload.to}`);
    return true;
  } catch (error) {
    logger.error('[SQS] Failed to send message:', error);
    return false; // Fail silently — don't break the trip-save transaction
  }
};
