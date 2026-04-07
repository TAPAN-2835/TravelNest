import winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';

const logGroupName = process.env.CLOUDWATCH_LOG_GROUP || 'TravelNest-Logs';
const logStreamName = `${process.env.NODE_ENV || 'development'}-stream`;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

if (process.env.NODE_ENV === 'production') {
  logger.add(new WinstonCloudWatch({
    logGroupName,
    logStreamName,
    awsRegion: process.env.AWS_REGION || 'us-east-1',
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
    messageFormatter: ({ level, message, ...meta }) => 
      `[${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`
  }));
}

export default logger;
