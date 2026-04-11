import { S3Client } from '@aws-sdk/client-s3';
import { SESClient } from '@aws-sdk/client-ses';
import { SQSClient } from '@aws-sdk/client-sqs';
import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs';
import { SchedulerClient } from '@aws-sdk/client-scheduler';

const config: any = {
  region: process.env.AWS_REGION || 'us-east-1',
};

// Only add credentials if explicitly provided (e.g., local development)
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  config.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

export const s3Client = new S3Client(config);
export const sesClient = new SESClient(config);
export const sqsClient = new SQSClient(config);
export const cwClient = new CloudWatchLogsClient(config);
export const schedulerClient = new SchedulerClient(config);
