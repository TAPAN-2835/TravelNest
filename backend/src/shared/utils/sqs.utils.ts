import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import logger from './logger';

// Ensure region and credentials exist (will fall back to IAM Roles in EC2 natively)
const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || 'ap-south-1',
});

/**
 * Dispatches a message to an SQS Queue for asynchronous processing.
 */
export const sendMessageToQueue = async (payload: any): Promise<boolean> => {
  const queueUrl = process.env.SQS_QUEUE_URL;
  if (!queueUrl) {
    logger.error('SQS_QUEUE_URL validation failed: Environment variable is missing.');
    // Fail gracefully so the frontend transaction doesn't abort.
    return false;
  }

  try {
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(payload),
    });

    const response = await sqsClient.send(command);
    logger.info(`Message dispatched to SQS successfully [MessageID: ${response.MessageId}]`);
    return true;
  } catch (error) {
    logger.error('Failed to send message to SQS:', error);
    return false;
  }
};
