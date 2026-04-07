import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { sqsClient } from '../../config/aws';

export class SQSService {
  private static getQueueUrl(queueName: string): string {
    const accountId = process.env.AWS_ACCOUNT_ID;
    const region = process.env.AWS_REGION || 'us-east-1';
    return `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`;
  }

  static async sendMessage(queueName: string, messageBody: any) {
    try {
      const command = new SendMessageCommand({
        QueueUrl: this.getQueueUrl(queueName),
        MessageBody: JSON.stringify(messageBody),
      });

      const response = await sqsClient.send(command);
      console.log(`[SQS] Message sent to ${queueName}:`, response.MessageId);
      return response;
    } catch (error) {
      console.error(`[SQS] Error sending message to ${queueName}:`, error);
      throw error;
    }
  }
}
