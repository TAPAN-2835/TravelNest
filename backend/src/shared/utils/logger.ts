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
  const cwConfig: any = {
    logGroupName,
    logStreamName,
    awsRegion: process.env.AWS_REGION || 'us-east-1',
    messageFormatter: ({ level, message, ...meta }: any) => 
      `[${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`
  };

  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    cwConfig.awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
    cwConfig.awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
  }

  logger.add(new WinstonCloudWatch(cwConfig));
}

export default logger;
